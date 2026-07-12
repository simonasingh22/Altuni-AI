import { companyResearchService } from '../services/companyResearch.service.js';
import { tavilyProvider } from '../providers/tavily.provider.js';
import { newsProvider } from '../providers/news.provider.js';
import { logger } from '../utils/logger.js';

export class ResearchChain {
  constructor(
    rService = companyResearchService,
    sProvider = tavilyProvider,
    nProvider = newsProvider
  ) {
    this.rService = rService;
    this.sProvider = sProvider;
    this.nProvider = nProvider;
  }

  async execute(companyName) {
    logger.info('Executing ResearchChain data ingress pipeline', { companyName });

    // 1. Fetch normalized company fundamentals from Yahoo Finance
    const companyData = await this.rService.getCompanyResearch(companyName);

    // 2. Fetch Tavily web context and News API articles concurrently
    const webPromise = this.sProvider.search(`${companyName} SWOT analysis competitor business model`)
      .catch((error) => {
        logger.warn('Tavily search failed inside ResearchChain, falling back to empty web data', {
          companyName,
          error: error.message
        });
        return [];
      });

    const newsPromise = this.nProvider.getLatestNews(companyName)
      .catch((error) => {
        logger.warn('News API fetch failed inside ResearchChain, falling back to empty news data', {
          companyName,
          error: error.message
        });
        return [];
      });

    const [webData, newsData] = await Promise.all([webPromise, newsPromise]);
    const timestamp = new Date().toISOString();

    return {
      companyData,
      webData,
      newsData,
      timestamp
    };
  }
}

export const researchChain = new ResearchChain();
