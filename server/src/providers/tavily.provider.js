import { env } from '../config/environment.js';
import { ConfigurationError, ExternalAPIError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class TavilyProvider {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
  }

  loadConfiguration() {
    if (this.apiKey) {
      return this.apiKey;
    }

    const key = env.TAVILY_API_KEY ?? process.env.TAVILY_API_KEY;
    if (!key) {
      throw new ConfigurationError('Tavily API key is not configured. Please set TAVILY_API_KEY.');
    }

    this.apiKey = key;
    return this.apiKey;
  }

  async search(query, maxResults = 5) {
    const apiKey = this.loadConfiguration();

    logger.info('Executing Tavily web search', { query, maxResults });

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'basic',
          max_results: maxResults,
          include_answer: false,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          errorDetails = await response.text();
        } catch {
          // ignore parsing error
        }

        throw new ExternalAPIError(`Tavily search API failed with status ${response.status}`, {
          details: {
            status: response.status,
            errorDetails
          }
        });
      }

      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];

      return results.map((result) => ({
        title: result.title ?? 'Untitled Source',
        url: result.url ?? '',
        content: result.content ?? ''
      }));
    } catch (error) {
      if (error instanceof ExternalAPIError || error instanceof ConfigurationError) {
        throw error;
      }

      throw new ExternalAPIError('Tavily search request failed due to network or configuration issue', {
        cause: error,
        details: {
          message: error.message
        }
      });
    }
  }
}

export const tavilyProvider = new TavilyProvider();
