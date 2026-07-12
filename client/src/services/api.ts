import axios from 'axios';

// TypeScript interfaces matching the backend investment schema
export interface MetricDetail {
  value: number | null;
  unit?: string | null;
  period?: string | null;
  trend?: 'up' | 'down' | 'flat' | 'unknown' | null;
  commentary?: string | null;
  sourceIds?: string[];
}

export interface FinancialHighlights {
  revenue: MetricDetail;
  netIncome: MetricDetail;
  eps: MetricDetail;
  marketCap: MetricDetail;
  peRatio: MetricDetail;
  debtToEquity: MetricDetail;
  roe: MetricDetail;
  profitMargin: MetricDetail;
  revenueGrowth: MetricDetail;
  cashFlow: MetricDetail;
}

export interface NewsSentiment {
  overall: 'positive' | 'neutral' | 'negative' | 'mixed';
  score: number;
  rationale: string;
  sampleCount: number;
}

export interface TargetPriceValuationRange {
  low: number;
  high: number;
  base: number;
}

export interface SWOTPoint {
  point: string;
  evidence: string;
  implication: string;
}

export interface SWOT {
  strengths: SWOTPoint[];
  weaknesses: SWOTPoint[];
  opportunities: SWOTPoint[];
  threats: SWOTPoint[];
}

export interface AIAnalysis {
  swot: SWOT;
  keyGrowthCatalysts: string[];
  criticalRiskFactors: string[];
  industryCompetitivePositioning: string;
  targetPriceValuationRange: TargetPriceValuationRange;
}

export interface ReasoningItem {
  step: string;
  explanation: string;
  evidenceRefs?: string[];
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
}

export interface RiskItem {
  risk: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  mitigation?: string;
}

export interface AdvantageItem {
  advantage: string;
  evidence: string;
  impact: string;
}

export interface CompetitorItem {
  company: string;
  ticker?: string | null;
  whyRelevant: string;
  comparisonSummary?: string;
}

export interface ReportSource {
  name: string;
  type: 'financial' | 'news' | 'web';
  url: string;
  accessedAt: string;
  note?: string;
}

export interface InvestmentReport {
  schemaVersion: string;
  company: string;
  ticker?: string | null;
  sector?: string | null;
  industry?: string | null;
  headquarters?: string | null;
  founded?: string | null;
  ceo?: string | null;
  employees?: number | null;
  businessSummary: string;
  financialHighlights: FinancialHighlights;
  latestNews: NewsItem[];
  newsSentiment: NewsSentiment;
  businessRisks: RiskItem[];
  competitiveAdvantages: AdvantageItem[];
  competitorAnalysis: CompetitorItem[];
  swot: SWOT;
  pros: string[];
  cons: string[];
  investmentScore: number;
  confidence: number;
  decisionBand: 'INVEST' | 'CONSIDER' | 'PASS';
  recommendation: 'INVEST' | 'PASS';
  reasoning: ReasoningItem[];
  sources: ReportSource[];
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  service: string;
  version: string;
  timestamp: string;
  requestId: string;
  message: string;
  errorCode: string;
  details?: any;
}

export interface HistorySummary {
  id: string;
  company: string;
  ticker: string;
  recommendation: 'INVEST' | 'PASS';
  investmentScore: number;
  timestamp: string;
}

export const apiService = {
  async analyzeCompany(companyName: string): Promise<InvestmentReport> {
    try {
      const response = await axios.get<InvestmentReport>(
        `/api/company/${encodeURIComponent(companyName)}/analyze`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data as ApiErrorResponse;
      }
      throw {
        message: error.message || 'An unexpected error occurred during analysis.',
        errorCode: 'CLIENT_ERROR'
      } as ApiErrorResponse;
    }
  },

  async getHistoryList(): Promise<HistorySummary[]> {
    try {
      const response = await axios.get<HistorySummary[]>('/api/history');
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data as ApiErrorResponse;
      }
      throw {
        message: error.message || 'Failed to retrieve history.',
        errorCode: 'CLIENT_ERROR'
      } as ApiErrorResponse;
    }
  },

  async getHistoryAnalysis(id: string): Promise<InvestmentReport> {
    try {
      const response = await axios.get<InvestmentReport>(`/api/history/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data as ApiErrorResponse;
      }
      throw {
        message: error.message || 'Failed to retrieve history analysis.',
        errorCode: 'CLIENT_ERROR'
      } as ApiErrorResponse;
    }
  }
};
