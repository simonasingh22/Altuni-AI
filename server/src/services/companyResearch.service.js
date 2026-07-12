import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { yahooFinanceProvider } from '../providers/yahooFinance.provider.js';

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
}

function mergeNormalizedData(searchResult, profileResult, financialResult, quoteResult, statisticsResult) {
  const marketCap = pickFirst(financialResult.marketCap, quoteResult.marketCap);
  const revenue = pickFirst(financialResult.revenue);
  const netIncome = pickFirst(financialResult.netIncome);
  const profitMargin = pickFirst(financialResult.profitMargin);
  const cashFlow = pickFirst(financialResult.cashFlow);

  return {
    company: pickFirst(searchResult.company, profileResult.company, searchResult.ticker),
    ticker: pickFirst(searchResult.ticker, profileResult.ticker, quoteResult.ticker),
    industry: pickFirst(profileResult.industry),
    sector: pickFirst(profileResult.sector),
    marketCap,
    revenue,
    netIncome,
    profitMargin,
    cashFlow,
    peRatio: pickFirst(statisticsResult.peRatio),
    debtToEquity: pickFirst(statisticsResult.debtToEquity),
    roe: pickFirst(statisticsResult.roe),
    currentPrice: pickFirst(quoteResult.currentPrice),
    currency: pickFirst(quoteResult.currency),
    employees: pickFirst(profileResult.employees),
    headquarters: pickFirst(profileResult.headquarters),
    ceo: pickFirst(profileResult.ceo),
    founded: pickFirst(profileResult.founded)
  };
}

export class CompanyResearchService {
  constructor(provider = yahooFinanceProvider) {
    this.provider = provider;
  }

  async getCompanyResearch(companyName) {
    const searchResult = await this.provider.searchCompany(companyName);

    if (!searchResult?.ticker) {
      throw new NotFoundError(`Company not found: ${companyName}`, {
        companyName
      });
    }

    const profilePromise = this.provider.getCompanyProfile(searchResult.ticker);
    const financialPromise = this.provider.getFinancialHighlights(searchResult.ticker);
    const quotePromise = this.provider.getQuote(searchResult.ticker);
    const statisticsPromise = this.provider.getStatistics(searchResult.ticker);

    const [profileResult, financialResult, quoteResult, statisticsResult] = await Promise.allSettled([
      profilePromise,
      financialPromise,
      quotePromise,
      statisticsPromise
    ]);

    const resolvedProfile = profileResult.status === 'fulfilled' ? profileResult.value : {};
    const resolvedFinancial = financialResult.status === 'fulfilled' ? financialResult.value : {};
    const resolvedQuote = quoteResult.status === 'fulfilled' ? quoteResult.value : {};
    const resolvedStatistics = statisticsResult.status === 'fulfilled' ? statisticsResult.value : {};

    for (const settlement of [profileResult, financialResult, quoteResult, statisticsResult]) {
      if (settlement.status === 'rejected') {
        logger.warn('Yahoo Finance data fetch failed for a company research field', {
          companyName,
          ticker: searchResult.ticker,
          error: {
            name: settlement.reason?.name,
            message: settlement.reason?.message,
            errorCode: settlement.reason?.errorCode
          }
        });
      }
    }

    return mergeNormalizedData(searchResult, resolvedProfile, resolvedFinancial, resolvedQuote, resolvedStatistics);
  }
}

export const companyResearchService = new CompanyResearchService();
