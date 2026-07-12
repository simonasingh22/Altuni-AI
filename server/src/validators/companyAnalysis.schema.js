import { z } from 'zod';

export const metricSchema = z.object({
  value: z.union([z.number(), z.string()]).nullable(),
  unit: z.string(),
  period: z.string(),
  trend: z.enum(['up', 'down', 'flat', 'mixed', 'unknown']).optional(),
  commentary: z.string().optional(),
  sourceIds: z.array(z.string()).optional()
});

export const newsItemSchema = z.object({
  title: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  summary: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  relevanceScore: z.number().min(0).max(100)
});

export const newsSentimentSchema = z.object({
  overall: z.enum(['positive', 'neutral', 'negative', 'mixed']),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  sampleCount: z.number().int().nonnegative()
});

export const riskItemSchema = z.object({
  risk: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  impact: z.string(),
  mitigation: z.string().optional()
});

export const advantageItemSchema = z.object({
  advantage: z.string(),
  evidence: z.string(),
  impact: z.string()
});

export const competitorItemSchema = z.object({
  company: z.string(),
  ticker: z.string().nullable().optional(),
  whyRelevant: z.string(),
  comparisonSummary: z.string()
});

export const swotPointSchema = z.object({
  point: z.string(),
  evidence: z.string(),
  implication: z.string()
});

export const swotSchema = z.object({
  strengths: z.array(swotPointSchema),
  weaknesses: z.array(swotPointSchema),
  opportunities: z.array(swotPointSchema),
  threats: z.array(swotPointSchema)
});

export const reasoningItemSchema = z.object({
  step: z.string(),
  explanation: z.string(),
  evidenceRefs: z.array(z.string()).optional()
});

export const sourceItemSchema = z.object({
  name: z.string(),
  type: z.enum(['financial', 'news', 'web', 'analyst', 'other']),
  url: z.string(),
  accessedAt: z.string(),
  note: z.string().optional()
});

export const companyAnalysisSchema = z.object({
  schemaVersion: z.string(),
  company: z.string(),
  ticker: z.string().nullable().optional(),
  industry: z.string().nullable(),
  sector: z.string().nullable(),
  headquarters: z.string().nullable(),
  founded: z.string().nullable().optional(),
  ceo: z.string().nullable().optional(),
  employees: z.number().int().nonnegative().nullable().optional(),
  businessSummary: z.string(),
  financialHighlights: z.object({
    revenue: metricSchema,
    netIncome: metricSchema,
    eps: metricSchema,
    marketCap: metricSchema,
    peRatio: metricSchema,
    debtToEquity: metricSchema,
    roe: metricSchema,
    profitMargin: metricSchema,
    revenueGrowth: metricSchema,
    cashFlow: metricSchema
  }),
  latestNews: z.array(newsItemSchema),
  newsSentiment: newsSentimentSchema,
  businessRisks: z.array(riskItemSchema),
  competitiveAdvantages: z.array(advantageItemSchema),
  competitorAnalysis: z.array(competitorItemSchema),
  swot: swotSchema,
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  investmentScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  decisionBand: z.enum(['INVEST', 'CONSIDER', 'PASS']),
  recommendation: z.enum(['INVEST', 'PASS']),
  reasoning: z.array(reasoningItemSchema),
  sources: z.array(sourceItemSchema),
  timestamp: z.string()
});
