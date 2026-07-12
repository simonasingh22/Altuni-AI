export const investmentPromptTemplate = 'You are a concise and accurate AI assistant for investment research. Answer the user\'s prompt directly and clearly.';

/**
 * Builds the structured prompt instructing Gemini to analyze the company data
 * and return the report in the canonical JSON format.
 *
 * @param {object} companyData Normalized company fundamentals from Yahoo Finance.
 * @param {Array} newsData Array of news items (optional).
 * @param {Array} webData Array of web search results (optional).
 * @param {string} timestamp ISO timestamp of the request.
 * @returns {string} The full prompt.
 */
export function buildInvestmentPrompt({ companyData, newsData = [], webData = [], timestamp = new Date().toISOString() }) {
  return `You are a Lead Software Architect and Senior AI Investment Analyst. 
Analyze the following public company and generate a production-grade investment memo in JSON format.

CURRENT TIMESTAMP: ${timestamp}

--------------------------------------------------
INPUT DATA:
--------------------------------------------------

1. COMPANY FUNDAMENTALS (Yahoo Finance):
${JSON.stringify(companyData, null, 2)}

2. NEWS DATA:
${newsData.length > 0 ? JSON.stringify(newsData, null, 2) : 'No recent news coverage available.'}

3. WEB SEARCH & COMPETITIVE SIGNAL CONTEXT:
${webData.length > 0 ? JSON.stringify(webData, null, 2) : 'No additional web search context available.'}

--------------------------------------------------
OUTPUT CONTRACT:
--------------------------------------------------
You MUST return a single JSON object. Do not output any chat prefix, markdown wrappers, or explanations outside the JSON object.
Include every field listed in the schema exactly once. If a value is unknown, use null for scalar fields and [] for arrays instead of omitting the key.
Your JSON must strictly conform to the following schema:

{
  "schemaVersion": "1.0.0",
  "company": "Company Name",
  "ticker": "Ticker Symbol or null",
  "industry": "Industry or null",
  "sector": "Sector or null",
  "headquarters": "City, State, Country or null",
  "founded": "Founded Year or null",
  "ceo": "CEO Name or null",
  "employees": 12345 (integer or null),
  "businessSummary": "A concise overview of the business model and value proposition.",
  "financialHighlights": {
    "revenue": { "value": 12345.67, "unit": "USD/INR", "period": "TTM", "trend": "up/down/flat/mixed/unknown", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "netIncome": { "value": 12345.67, "unit": "USD/INR", "period": "TTM", "trend": "up/down/flat/mixed/unknown", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "eps": { "value": 12.34, "unit": "USD/INR per share", "period": "TTM", "trend": "up/down/flat/mixed/unknown", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "marketCap": { "value": 1234567.89, "unit": "USD/INR", "period": "current", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "peRatio": { "value": 25.4, "unit": "x", "period": "current", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "debtToEquity": { "value": 45.2, "unit": "% or x", "period": "current", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "roe": { "value": 15.6, "unit": "%", "period": "TTM", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "profitMargin": { "value": 12.5, "unit": "%", "period": "TTM", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "revenueGrowth": { "value": 8.5, "unit": "%", "period": "YoY", "commentary": "Short analysis", "sourceIds": ["src-1"] },
    "cashFlow": { "value": 12345.67, "unit": "USD/INR", "period": "TTM", "trend": "up/down/flat/mixed/unknown", "commentary": "Short analysis", "sourceIds": ["src-1"] }
  },
  "latestNews": [
    {
      "title": "News Title",
      "source": "Publisher Name",
      "url": "URL link",
      "publishedAt": "ISO date",
      "summary": "Short summary",
      "sentiment": "positive/neutral/negative",
      "relevanceScore": 85
    }
  ],
  "newsSentiment": {
    "overall": "positive/neutral/negative/mixed",
    "score": 75 (0 to 100),
    "rationale": "Why this score",
    "sampleCount": 1
  },
  "businessRisks": [
    {
      "risk": "Risk Name",
      "severity": "low/medium/high",
      "impact": "Description of impact",
      "mitigation": "Potential mitigation"
    }
  ],
  "competitiveAdvantages": [
    {
      "advantage": "Moat Name",
      "evidence": "Supporting evidence",
      "impact": "Strength description"
    }
  ],
  "competitorAnalysis": [
    {
      "company": "Competitor Name",
      "ticker": "Competitor Ticker or null",
      "whyRelevant": "Why they compete",
      "comparisonSummary": "How they compare"
    }
  ],
  "swot": {
    "strengths": [{ "point": "Strength", "evidence": "Why", "implication": "Impact" }],
    "weaknesses": [{ "point": "Weakness", "evidence": "Why", "implication": "Impact" }],
    "opportunities": [{ "point": "Opportunity", "evidence": "Why", "implication": "Impact" }],
    "threats": [{ "point": "Threat", "evidence": "Why", "implication": "Impact" }]
  },
  "pros": ["Pro bullet 1"],
  "cons": ["Con bullet 1"],
  "investmentScore": 75 (0 to 100),
  "confidence": 75 (0 to 100),
  "decisionBand": "INVEST/CONSIDER/PASS",
  "recommendation": "INVEST/PASS",
  "reasoning": [
    {
      "step": "Reasoning step",
      "explanation": "Why this matters",
      "evidenceRefs": ["sourceId"]
    }
  ],
  "sources": [
    {
      "name": "Source Name",
      "type": "financial/news/web/analyst/other",
      "url": "Source URL",
      "accessedAt": "ISO date",
      "note": "Optional comments"
    }
  ],
  "timestamp": "${timestamp}"
}

--------------------------------------------------
ANALYSIS RULES:
--------------------------------------------------

1. FINANCIAL ANALYSIS HIGHLIGHTS:
   Map the provided financial data exactly into the 'financialHighlights' properties. Comment on valuation ratios, profitability metrics, leverage, and growth in the commentaries. Calculate EPS (Net Income / Outstanding Shares if shares are known, or extract from standard signals if you have historical data; if completely unknown, set value to null).
   If any Yahoo metric was null in the input, you may search your parametric knowledge to fill it or comment on its unavailability.

2. SCORING RULES:
   Perform the following weighted calculations to compute "investmentScore":
   - Financial Health (30 points): Evaluate margins, leverage (Debt/Equity), ROE, cash flow.
   - Growth (20 points): Evaluate YoY revenue growth, profit growth.
   - Valuation (15 points): Evaluate PE ratio context relative to peers/growth.
   - News Sentiment (15 points): Tone of recent narratives.
   - Competitive Position (10 points): Brand moat, network effects, scale.
   - Risk (10 points): Industry headwind, legal/regulatory risk.
   Final Score = Sum of weighted component scores.

3. CONFIDENCE RULES:
   Calculate the "confidence" score (0-100):
   - Data Completeness: 35 points
   - Data Recency: 20 points
   - Source Quality: 15 points
   - Cross-source Agreement: 20 points
   - Identity Certainty: 10 points
   Since Tavily/News API results are empty in the inputs, cap the confidence score at a maximum of 65/100, reflecting the lack of live news and web scraping context. Explain this limitation in the confidence rationale or reasoning.

4. RECOMMENDATION RULES:
   - decisionBand:
     - Score >= 80: INVEST
     - Score between 60-79: CONSIDER
     - Score < 60: PASS
   - recommendation:
     - recommendation is ONLY "INVEST" if decisionBand is "INVEST", confidence is >= 70, and no severe red flags are present.
     - Since confidence is capped at 65 (due to missing live web/news data inputs), the final recommendation MUST be "PASS" (with decisionBand showing "INVEST" or "CONSIDER" based on the score). This enforces a safe margin.

5. VERACITY:
   Do not fabricate numbers. If financial data is missing in inputs, set the metric value to null and discuss it in the comments.

Produce the raw JSON output now.
`;
}