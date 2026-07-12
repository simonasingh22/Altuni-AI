import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { APP_NAME, APP_VERSION, DEFAULT_CORS_ORIGIN, DEFAULT_ENVIRONMENT, DEFAULT_HOST, DEFAULT_LOG_LEVEL, DEFAULT_PORT } from '../utils/constants.js';
import { ConfigurationError } from '../utils/errors.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(moduleDir, '..', '..');
const repoRoot = path.resolve(serverRoot, '..');

for (const envFile of [
  path.resolve(repoRoot, '.env'),
  path.resolve(repoRoot, '.env.local'),
  path.resolve(serverRoot, '.env'),
  path.resolve(serverRoot, '.env.local')
]) {
  dotenv.config({ path: envFile });
}

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default(DEFAULT_ENVIRONMENT),
  PORT: z.coerce.number().int().min(1).max(65535).default(DEFAULT_PORT),
  HOST: z.string().min(1).default(DEFAULT_HOST),
  APP_NAME: z.string().min(1).default(APP_NAME),
  APP_VERSION: z.string().min(1).default(APP_VERSION),
  CORS_ORIGIN: z.string().min(1).default(DEFAULT_CORS_ORIGIN),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default(DEFAULT_LOG_LEVEL),
  TAVILY_API_KEY: z.string().trim().min(1).optional(),
  NEWS_API_KEY: z.string().trim().min(1).optional()
});

export function loadEnvironment() {
  const parsedEnvironment = environmentSchema.safeParse(process.env);

  if (!parsedEnvironment.success) {
    throw new ConfigurationError('Invalid environment configuration', {
      issues: parsedEnvironment.error.flatten()
    });
  }

  return Object.freeze(parsedEnvironment.data);
}

export const env = loadEnvironment();
