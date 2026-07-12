import { geminiService } from '../services/gemini.service.js';
import { buildInvestmentPrompt } from '../prompts/investment.prompt.js';
import { companyAnalysisSchema } from '../validators/companyAnalysis.schema.js';
import { ExternalAPIError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

function cleanJsonString(rawText) {
  let cleaned = rawText.trim();
  // Strip markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

function createMetricFallback() {
  return {
    value: null,
    unit: '',
    period: '',
    trend: 'unknown',
    commentary: '',
    sourceIds: []
  };
}

function normalizeAnalysisPayload(payload, { companyName = '', ticker = null, timestamp = new Date().toISOString() } = {}) {
  const normalized = payload && typeof payload === 'object' && !Array.isArray(payload) ? { ...payload } : {};

  normalized.schemaVersion = normalized.schemaVersion ?? '1.0.0';
  normalized.company = normalized.company ?? companyName;
  normalized.ticker = normalized.ticker ?? ticker;
  normalized.industry = normalized.industry ?? null;
  normalized.sector = normalized.sector ?? null;
  normalized.headquarters = normalized.headquarters ?? null;
  normalized.founded = normalized.founded ?? null;
  normalized.ceo = normalized.ceo ?? null;
  normalized.employees = normalized.employees ?? null;
  normalized.businessSummary = normalized.businessSummary ?? '';

  const financialHighlights = normalized.financialHighlights && typeof normalized.financialHighlights === 'object'
    ? { ...normalized.financialHighlights }
    : {};

  for (const key of ['revenue', 'netIncome', 'eps', 'marketCap', 'peRatio', 'debtToEquity', 'roe', 'profitMargin', 'revenueGrowth', 'cashFlow']) {
    financialHighlights[key] = financialHighlights[key] && typeof financialHighlights[key] === 'object'
      ? {
          ...createMetricFallback(),
          ...financialHighlights[key],
          value: financialHighlights[key].value ?? null,
          trend: financialHighlights[key].trend ?? 'unknown',
          commentary: financialHighlights[key].commentary ?? '',
          sourceIds: Array.isArray(financialHighlights[key].sourceIds) ? financialHighlights[key].sourceIds : []
        }
      : createMetricFallback();
  }

  normalized.financialHighlights = financialHighlights;
  normalized.latestNews = Array.isArray(normalized.latestNews) ? normalized.latestNews : [];
  normalized.newsSentiment = normalized.newsSentiment && typeof normalized.newsSentiment === 'object'
    ? {
        overall: normalized.newsSentiment.overall ?? 'neutral',
        score: normalized.newsSentiment.score ?? 0,
        rationale: normalized.newsSentiment.rationale ?? '',
        sampleCount: normalized.newsSentiment.sampleCount ?? 0
      }
    : {
        overall: 'neutral',
        score: 0,
        rationale: '',
        sampleCount: 0
      };
  normalized.businessRisks = Array.isArray(normalized.businessRisks) ? normalized.businessRisks : [];
  normalized.competitiveAdvantages = Array.isArray(normalized.competitiveAdvantages) ? normalized.competitiveAdvantages : [];
  normalized.competitorAnalysis = Array.isArray(normalized.competitorAnalysis) ? normalized.competitorAnalysis : [];
  normalized.swot = normalized.swot && typeof normalized.swot === 'object'
    ? {
        strengths: Array.isArray(normalized.swot.strengths) ? normalized.swot.strengths : [],
        weaknesses: Array.isArray(normalized.swot.weaknesses) ? normalized.swot.weaknesses : [],
        opportunities: Array.isArray(normalized.swot.opportunities) ? normalized.swot.opportunities : [],
        threats: Array.isArray(normalized.swot.threats) ? normalized.swot.threats : []
      }
    : {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      };
  normalized.pros = Array.isArray(normalized.pros) ? normalized.pros : [];
  normalized.cons = Array.isArray(normalized.cons) ? normalized.cons : [];
  normalized.investmentScore = normalized.investmentScore ?? 0;
  normalized.confidence = normalized.confidence ?? 0;
  normalized.decisionBand = ['INVEST', 'CONSIDER', 'PASS'].includes(normalized.decisionBand) ? normalized.decisionBand : 'PASS';
  normalized.recommendation = ['INVEST', 'PASS'].includes(normalized.recommendation) ? normalized.recommendation : 'PASS';
  normalized.reasoning = Array.isArray(normalized.reasoning) ? normalized.reasoning : [];
  normalized.sources = Array.isArray(normalized.sources) ? normalized.sources : [];
  normalized.timestamp = normalized.timestamp ?? timestamp;

  return normalized;
}

export class InvestmentChain {
  constructor(llmService = geminiService) {
    this.llmService = llmService;
  }

  async execute(researchContext) {
    const { companyData, newsData, webData, timestamp } = researchContext;
    const companyName = companyData.company;

    // 1. Build prompt
    const prompt = buildInvestmentPrompt({
      companyData,
      newsData,
      webData,
      timestamp
    });

    // 2. Query LLM
    logger.info('Sending prompt to Gemini inside InvestmentChain', {
      companyName,
      ticker: companyData.ticker
    });

    const rawResponse = await this.llmService.generateResponse(prompt);
    const cleanedResponse = cleanJsonString(rawResponse);

    // 3. Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      logger.error('InvestmentChain failed to parse Gemini output as JSON', {
        companyName,
        rawResponse,
        error: parseError.message
      });
      throw new ExternalAPIError('Gemini response was not valid JSON', {
        cause: parseError,
        details: {
          rawResponse
        }
      });
    }

    // 4. Schema validation
    const normalizedData = normalizeAnalysisPayload(parsedData, {
      companyName,
      ticker: companyData.ticker,
      timestamp
    });
    const validationResult = companyAnalysisSchema.safeParse(normalizedData);
    if (!validationResult.success) {
      logger.error('InvestmentChain Gemini output failed schema validation', {
        companyName,
        issues: validationResult.error.flatten(),
        parsedData: normalizedData
      });
      throw new ExternalAPIError('Gemini output did not match the required schema', {
        details: validationResult.error.flatten()
      });
    }

    const validatedData = validationResult.data;

    // 5. Programmatic scoring, confidence and recommendation updates
    const score = validatedData.investmentScore;
    let decisionBand = 'PASS';
    if (score >= 80) {
      decisionBand = 'INVEST';
    } else if (score >= 60) {
      decisionBand = 'CONSIDER';
    }
    validatedData.decisionBand = decisionBand;

    const hasWeb = Array.isArray(webData) && webData.length > 0;
    const hasNews = Array.isArray(newsData) && newsData.length > 0;
    const confidenceCap = (hasWeb && hasNews) ? 100 : (hasWeb || hasNews) ? 80 : 65;

    if (validatedData.confidence > confidenceCap) {
      logger.info('InvestmentChain capping confidence score due to data context bounds', {
        companyName,
        cap: confidenceCap,
        originalConfidence: validatedData.confidence
      });
      validatedData.confidence = confidenceCap;
    }

    validatedData.recommendation = (decisionBand === 'INVEST' && validatedData.confidence >= 70) ? 'INVEST' : 'PASS';

    // 6. Source collection integrity check
    const yahooSourceExists = validatedData.sources.some(src => src.type === 'financial' && src.name.toLowerCase().includes('yahoo'));
    if (!yahooSourceExists) {
      validatedData.sources.push({
        name: 'Yahoo Finance API',
        type: 'financial',
        url: 'https://finance.yahoo.com',
        accessedAt: timestamp,
        note: 'Primary financial metrics retrieved programmatically.'
      });
    }

    if (hasWeb) {
      for (const item of webData) {
        const sourceExists = validatedData.sources.some(src => src.url === item.url);
        if (!sourceExists && item.url) {
          validatedData.sources.push({
            name: item.title || 'Web Search Result',
            type: 'web',
            url: item.url,
            accessedAt: timestamp,
            note: 'Retrieved via Tavily web search.'
          });
        }
      }
    }

    if (hasNews) {
      for (const article of newsData) {
        const sourceExists = validatedData.sources.some(src => src.url === article.url);
        if (!sourceExists && article.url) {
          validatedData.sources.push({
            name: article.title || 'News Article',
            type: 'news',
            url: article.url,
            accessedAt: timestamp,
            note: `Retrieved via News API from ${article.source}.`
          });
        }
      }
    }

    return validatedData;
  }
}

export const investmentChain = new InvestmentChain();
