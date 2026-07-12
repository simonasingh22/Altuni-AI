import Groq from 'groq-sdk';
import { z } from 'zod';
import { ConfigurationError, ExternalAPIError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const groqConfigSchema = z.object({
  GROQ_API_KEY: z.string().trim().min(1),
  GROQ_MODEL: z.string().trim().min(1).default('llama-3.3-70b-versatile'),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().max(60000).default(15000),
  GROQ_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(2)
});

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const TRANSIENT_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'EAI_AGAIN',
  'ENOTFOUND',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'ABORT_ERR'
]);

function normalizePrompt(prompt) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new ValidationError('Prompt is required', {
      field: 'prompt'
    });
  }

  return prompt.trim();
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isTransientFailure(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (typeof error.status === 'number' && TRANSIENT_STATUS_CODES.has(error.status)) {
    return true;
  }

  if (typeof error.code === 'number' && TRANSIENT_STATUS_CODES.has(error.code)) {
    return true;
  }

  if (typeof error.code === 'string' && TRANSIENT_ERROR_CODES.has(error.code)) {
    return true;
  }

  const message = String(error.message ?? '').toLowerCase();
  return message.includes('timeout') || message.includes('temporarily unavailable') || message.includes('rate limit');
}

function normalizeResponseText(response) {
  const text = typeof response?.choices?.[0]?.message?.content === 'string' ? response.choices[0].message.content.trim() : '';

  if (!text) {
    throw new ExternalAPIError('Groq returned an empty response', {
      details: {
        source: 'groq'
      }
    });
  }

  return text;
}

function serializeError(error) {
  return {
    name: error?.name ?? 'Error',
    message: error?.message ?? 'Unknown error',
    status: typeof error?.status === 'number' ? error.status : null,
    code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : null
  };
}

export class GeminiProvider {
  constructor({ client = null, config = null } = {}) {
    this.client = client;
    this.config = config;
  }

  loadConfiguration() {
    if (this.config) {
      return this.config;
    }

    const parsedConfig = groqConfigSchema.safeParse(process.env);

    if (!parsedConfig.success) {
      throw new ConfigurationError('Invalid Groq configuration', {
        issues: parsedConfig.error.flatten()
      });
    }

    this.config = parsedConfig.data;
    return this.config;
  }

  getClient() {
    if (this.client) {
      return this.client;
    }

    const { GROQ_API_KEY } = this.loadConfiguration();
    this.client = new Groq({
      apiKey: GROQ_API_KEY
    });

    return this.client;
  }

  async generateResponse(prompt) {
    const normalizedPrompt = normalizePrompt(prompt);
    const { GROQ_MODEL, GROQ_TIMEOUT_MS, GROQ_MAX_RETRIES } = this.loadConfiguration();
    const client = this.getClient();

    let lastError = null;

    for (let attempt = 0; attempt <= GROQ_MAX_RETRIES; attempt += 1) {
      try {
        const response = await client.chat.completions.create(
          {
            model: GROQ_MODEL,
            messages: [
              {
                role: 'user',
                content: normalizedPrompt
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1
          },
          {
            timeout: GROQ_TIMEOUT_MS
          }
        );

        return normalizeResponseText(response);
      } catch (error) {
        lastError = error;

        if (!isTransientFailure(error) || attempt === GROQ_MAX_RETRIES) {
          break;
        }

        logger.warn('Groq request failed, retrying', {
          attempt: attempt + 1,
          maxRetries: GROQ_MAX_RETRIES,
          error: serializeError(error)
        });

        await delay(250 * (attempt + 1));
      }
    }

    throw new ExternalAPIError('Groq request failed', {
      cause: lastError,
      details: serializeError(lastError)
    });
  }
}

export const geminiProvider = new GeminiProvider();
