import { env } from '../config/environment.js';
import { ConfigurationError, ExternalAPIError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class NewsProvider {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
  }

  loadConfiguration() {
    if (this.apiKey) {
      return this.apiKey;
    }

    const key = env.NEWS_API_KEY ?? process.env.NEWS_API_KEY;
    if (!key) {
      throw new ConfigurationError('News API key is not configured. Please set NEWS_API_KEY.');
    }

    this.apiKey = key;
    return this.apiKey;
  }

  async getLatestNews(query, maxResults = 5) {
    const apiKey = this.loadConfiguration();

    logger.info('Fetching latest news articles from News API', { query, maxResults });

    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${maxResults}&sortBy=publishedAt&apiKey=${apiKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          errorDetails = await response.text();
        } catch {
          // ignore parsing error
        }

        throw new ExternalAPIError(`News API failed with status ${response.status}`, {
          details: {
            status: response.status,
            errorDetails
          }
        });
      }

      const data = await response.json();
      const articles = Array.isArray(data?.articles) ? data.articles : [];

      return articles.map((article) => ({
        title: article.title ?? 'Untitled Article',
        source: article.source?.name ?? 'Unknown Source',
        url: article.url ?? '',
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        description: article.description ?? article.content ?? 'No summary description available.'
      }));
    } catch (error) {
      if (error instanceof ExternalAPIError || error instanceof ConfigurationError) {
        throw error;
      }

      throw new ExternalAPIError('News API request failed due to network or configuration issue', {
        cause: error,
        details: {
          message: error.message
        }
      });
    }
  }
}

export const newsProvider = new NewsProvider();
