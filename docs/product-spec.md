# Product Vision

Build a production-grade AI Investment Research Agent that turns a company name into a structured investment memo with a clear recommendation, supporting evidence, and a repeatable analysis contract.

The product should feel like a real decision-support SaaS tool, not a demo. It must be:
- Fast enough to feel interactive.
- Structured enough to be machine-readable.
- Explainable enough for users to trust.
- Modular enough for the backend and AI workflow to scale.

The system will ingest public company data, news, and web context, then synthesize a research report that can be rendered directly in the UI and stored in history.

The output contract in this document is the source of truth for all later implementation work.

# Functional Requirements

## Core User Capability
- The user can enter a company name.
- The system resolves the company identity as accurately as possible.
- The system gathers financial, news, and web context.
- The system produces a structured investment research report.
- The system returns a recommendation and supporting rationale.
- The system stores prior analyses for later review.

## Report Content Requirements
The report must always include the following top-level sections or equivalent structured fields:
- Company identity fields.
- Business summary.
- Financial highlights.
- Latest news.
- News sentiment.
- Business risks.
- Competitive advantages.
- Competitor analysis.
- SWOT analysis.
- Pros.
- Cons.
- Investment score.
- Confidence score.
- Recommendation.
- Reasoning.
- Sources.
- Timestamp.

## Product Behavior Requirements
- If data is incomplete, the report must explicitly reflect that uncertainty.
- If the company is ambiguous, the system must choose the best match or mark the result as low confidence.
- If a data source fails, the system should still return a partial analysis when possible.
- The AI output must always be structured JSON.
- The JSON must be deterministic in shape even when some values are null or unavailable.

# Non Functional Requirements

## Reliability
- The schema must be strict enough to reject malformed AI output.
- The contract must support partial data without breaking the UI.
- Confidence must communicate when the result is weak or uncertain.

## Maintainability
- The analysis contract must be versioned.
- Field names must stay stable across later milestones.
- The spec must support clean separation between data fetching, AI reasoning, validation, and rendering.

## Explainability
- Every score must be decomposable into named components.
- Every recommendation must have visible reasons.
- Source evidence must be preserved in the final payload.

## Performance
- The analysis should return in a reasonable user-facing time window.
- The report structure must support streaming or staged loading later if needed.

## Security and Safety
- Only public company research should be used.
- The system must not fabricate factual values when a source is unavailable.
- The system must mark unknown or unresolved fields explicitly instead of guessing.

## Consistency
- Every run must return the same field names in the same structure.
- Arrays must always be arrays, even when empty.
- Numeric scores must always be numbers in the 0 to 100 range.

# User Flow

1. The user opens the homepage.
2. The user enters a company name.
3. The user submits the search.
4. The system resolves the company and begins research.
5. The UI shows loading states while data is gathered and analyzed.
6. The analysis result is displayed as a structured report.
7. The user reviews the recommendation, score, reasoning, pros, cons, and sources.
8. The user can revisit prior analyses from history.

# AI Workflow

1. Accept the company name.
2. Resolve the company identity and ticker if available.
3. Collect financial data.
4. Collect latest news.
5. Collect web context and competitive signals.
6. Normalize all data into a single research object.
7. Apply a structured prompt that forces JSON output.
8. Generate the investment report using the LLM.
9. Validate the JSON against the schema.
10. Return the validated payload to the frontend.

The AI workflow must always prefer evidence over guesswork.
If the model cannot find reliable data, it should lower confidence and state the limitation in reasoning.

# Complete JSON Schema

## Schema Contract
The AI must return one JSON object that follows this top-level shape:
- `schemaVersion` is required and identifies the contract version.
- `company` is required and is the canonical company name used in the analysis.
- `ticker` is optional because some companies will be private, ambiguous, or not mapped.
- `industry` is required when known; otherwise it may be null.
- `sector` is required when known; otherwise it may be null.
- `headquarters` is required when known; otherwise it may be null.
- `founded` is optional.
- `ceo` is optional.
- `employees` is optional.
- `businessSummary` is required.
- `financialHighlights` is required.
- `latestNews` is required and may be an empty array.
- `newsSentiment` is required.
- `businessRisks` is required and may be an empty array.
- `competitiveAdvantages` is required and may be an empty array.
- `competitorAnalysis` is required and may be an empty array.
- `swot` is required.
- `pros` is required and may be an empty array.
- `cons` is required and may be an empty array.
- `investmentScore` is required.
- `confidence` is required.
- `decisionBand` is required and captures the transparent score band.
- `recommendation` is required.
- `reasoning` is required and may be an empty array.
- `sources` is required and may be an empty array.
- `timestamp` is required.

## Top-Level Field Definitions

| Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| schemaVersion | string | Yes | Version identifier for the analysis contract. | "1.0.0" |
| company | string | Yes | Canonical company name used for the report. | "Infosys" |
| ticker | string or null | No | Public market ticker symbol when available. | "INFY" |
| industry | string or null | Yes | Primary industry classification. | "IT Services" |
| sector | string or null | Yes | Broader sector classification. | "Technology" |
| headquarters | string or null | Yes | Company headquarters location. | "Bengaluru, India" |
| founded | string or null | No | Founding year or date in human-readable form. | "1981" |
| ceo | string or null | No | Current chief executive officer. | "Salil Parekh" |
| employees | integer or null | No | Approximate employee count. | 343234 |
| businessSummary | string | Yes | Short narrative summary of what the company does. | "Global IT services and consulting provider." |
| financialHighlights | object | Yes | Structured financial metrics used in scoring. | see metric schema |
| latestNews | array of objects | Yes | Recent relevant news items. | see news item schema |
| newsSentiment | object | Yes | Aggregated sentiment summary of recent news. | see sentiment schema |
| businessRisks | array of objects | Yes | Principal business and execution risks. | see risk item schema |
| competitiveAdvantages | array of objects | Yes | Differentiators or moat indicators. | see advantage item schema |
| competitorAnalysis | array of objects | Yes | Comparison with relevant competitors. | see competitor schema |
| swot | object | Yes | SWOT analysis grouped into four buckets. | see SWOT schema |
| pros | array of strings | Yes | Positive investment considerations. | ["Strong cash generation"] |
| cons | array of strings | Yes | Negative investment considerations. | ["Moderating revenue growth"] |
| investmentScore | number | Yes | Weighted score from 0 to 100. | 82 |
| confidence | number | Yes | Confidence in the analysis from 0 to 100. | 91 |
| decisionBand | string | Yes | Transparent score band before the final binary action is applied. | "INVEST" |
| recommendation | string | Yes | Final binary recommendation after score, confidence, and override checks. | "INVEST" |
| reasoning | array of objects | Yes | Ordered explanation of the decision. | see reasoning item schema |
| sources | array of objects | Yes | Evidence sources used in the analysis. | see source item schema |
| timestamp | string | Yes | ISO 8601 timestamp for when the report was generated. | "2026-07-12T14:30:00Z" |

## Standard Metric Schema
All financial metric fields inside `financialHighlights` use the same structure.

| Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| value | number or string or null | Yes | Raw metric value. Use a string when the metric is more naturally represented as text. | 1734000000000 |
| unit | string | Yes | Unit of measurement. | "USD" |
| period | string | Yes | Reporting period or date label. | "TTM" |
| trend | string | No | Directional trend, if known. Allowed values: up, down, flat, mixed, unknown. | "up" |
| commentary | string | No | Short explanation of the metric and its significance. | "Revenue is expanding at a healthy pace." |
| sourceIds | array of strings | No | IDs or labels tying this metric back to sources. | ["yahoo-finance-1"] |

## Financial Highlights Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| revenue | metric object | Yes | Total revenue for the latest relevant period. | {"value": 12000000000, "unit": "USD", "period": "TTM", "trend": "up"} |
| netIncome | metric object | Yes | Net income for the latest relevant period. | {"value": 2500000000, "unit": "USD", "period": "TTM", "trend": "up"} |
| eps | metric object | Yes | Earnings per share. | {"value": 4.12, "unit": "USD/share", "period": "TTM", "trend": "up"} |
| marketCap | metric object | Yes | Market capitalization. | {"value": 150000000000, "unit": "USD", "period": "current"} |
| peRatio | metric object | Yes | Price-to-earnings ratio. | {"value": 28.4, "unit": "x", "period": "current"} |
| debtToEquity | metric object | Yes | Debt-to-equity ratio. | {"value": 0.31, "unit": "x", "period": "current"} |
| roe | metric object | Yes | Return on equity. | {"value": 18.7, "unit": "%", "period": "TTM"} |
| profitMargin | metric object | Yes | Net profit margin. | {"value": 21.3, "unit": "%", "period": "TTM"} |
| revenueGrowth | metric object | Yes | Revenue growth rate. | {"value": 12.8, "unit": "%", "period": "YoY"} |
| cashFlow | metric object | Yes | Operating or free cash flow, whichever is most reliable. | {"value": 3800000000, "unit": "USD", "period": "TTM", "trend": "up"} |

## Latest News Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| title | string | Yes | Headline of the news item. | "Company beats earnings estimates" |
| source | string | Yes | News publication or provider name. | "Reuters" |
| url | string | Yes | Canonical URL to the article. | "https://example.com/article" |
| publishedAt | string | Yes | ISO 8601 publication timestamp. | "2026-07-11T09:15:00Z" |
| summary | string | Yes | One-line summary of why the article matters. | "Management raised guidance for the next quarter." |
| sentiment | string | Yes | Article-level sentiment. Allowed values: positive, neutral, negative. | "positive" |
| relevanceScore | number | Yes | Relevance score from 0 to 100. | 88 |

## News Sentiment Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| overall | string | Yes | Aggregated sentiment label. Allowed values: positive, neutral, negative, mixed. | "positive" |
| score | number | Yes | Aggregated news sentiment score from 0 to 100. | 74 |
| rationale | string | Yes | Short explanation for the aggregated sentiment. | "Most recent coverage is constructive and earnings-focused." |
| sampleCount | integer | Yes | Number of news items considered. | 7 |

## Risk Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| risk | string | Yes | A specific risk statement. | "High dependence on enterprise IT spending cycles." |
| severity | string | Yes | Severity label. Allowed values: low, medium, high. | "high" |
| impact | string | Yes | Why the risk matters financially or strategically. | "Could slow revenue growth during a downturn." |
| mitigation | string | No | Any offsetting factor or mitigation. | "Recurring contracts reduce some volatility." |

## Competitive Advantage Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| advantage | string | Yes | Specific competitive advantage. | "Strong brand recognition." |
| evidence | string | Yes | Evidence that supports the advantage. | "Consistent market leadership and customer retention." |
| impact | string | Yes | Why the advantage matters to investors. | "Supports pricing power and resilience." |

## Competitor Analysis Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| company | string | Yes | Competitor company name. | "TCS" |
| ticker | string or null | No | Competitor ticker when available. | "TCS.NS" |
| whyRelevant | string | Yes | Why this competitor is relevant. | "Direct peer in IT services." |
| comparisonSummary | string | Yes | Short comparison versus the target company. | "Larger scale, similar margin profile, stronger brand depth." |

## SWOT Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| strengths | array of objects | Yes | Internal strengths. | see SWOT point schema |
| weaknesses | array of objects | Yes | Internal weaknesses. | see SWOT point schema |
| opportunities | array of objects | Yes | External opportunities. | see SWOT point schema |
| threats | array of objects | Yes | External threats. | see SWOT point schema |

### SWOT Point Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| point | string | Yes | One SWOT statement. | "Large addressable market." |
| evidence | string | Yes | Supporting evidence. | "Global digital transformation demand is still expanding." |
| implication | string | Yes | Investor relevance of the point. | "Supports long-term growth visibility." |

## Reasoning Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| step | string | Yes | Ordered reasoning step name. | "Financial health" |
| explanation | string | Yes | What the AI concluded and why. | "Profitability is strong and leverage is manageable." |
| evidenceRefs | array of strings | No | Source labels, URLs, or source IDs supporting the statement. | ["yahoo-finance-1", "news-2"] |

## Source Item Schema

| Field Name | Data Type | Required | Description | Example |
|---|---|---:|---|---|
| name | string | Yes | Human-readable source name. | "Yahoo Finance" |
| type | string | Yes | Source category. Allowed values: financial, news, web, analyst, other. | "financial" |
| url | string | Yes | Canonical URL or source endpoint. | "https://finance.yahoo.com" |
| accessedAt | string | Yes | ISO 8601 timestamp for when the source was accessed. | "2026-07-12T14:20:00Z" |
| note | string | No | Short note describing why the source was used. | "Used for market cap and ratio data." |

## Canonical JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Investment Research Report",
  "type": "object",
  "required": [
    "schemaVersion",
    "company",
    "industry",
    "sector",
    "headquarters",
    "businessSummary",
    "financialHighlights",
    "latestNews",
    "newsSentiment",
    "businessRisks",
    "competitiveAdvantages",
    "competitorAnalysis",
    "swot",
    "pros",
    "cons",
    "investmentScore",
    "confidence",
    "recommendation",
    "reasoning",
    "sources",
    "timestamp"
  ],
  "properties": {
    "schemaVersion": { "type": "string" },
    "company": { "type": "string" },
    "ticker": { "type": ["string", "null"] },
    "industry": { "type": ["string", "null"] },
    "sector": { "type": ["string", "null"] },
    "headquarters": { "type": ["string", "null"] },
    "founded": { "type": ["string", "null"] },
    "ceo": { "type": ["string", "null"] },
    "employees": { "type": ["integer", "null"], "minimum": 0 },
    "businessSummary": { "type": "string" },
    "financialHighlights": {
      "type": "object",
      "required": ["revenue", "netIncome", "eps", "marketCap", "peRatio", "debtToEquity", "roe", "profitMargin", "revenueGrowth", "cashFlow"],
      "properties": {
        "revenue": { "$ref": "#/$defs/metric" },
        "netIncome": { "$ref": "#/$defs/metric" },
        "eps": { "$ref": "#/$defs/metric" },
        "marketCap": { "$ref": "#/$defs/metric" },
        "peRatio": { "$ref": "#/$defs/metric" },
        "debtToEquity": { "$ref": "#/$defs/metric" },
        "roe": { "$ref": "#/$defs/metric" },
        "profitMargin": { "$ref": "#/$defs/metric" },
        "revenueGrowth": { "$ref": "#/$defs/metric" },
        "cashFlow": { "$ref": "#/$defs/metric" }
      },
      "additionalProperties": false
    },
    "latestNews": {
      "type": "array",
      "items": { "$ref": "#/$defs/newsItem" }
    },
    "newsSentiment": { "$ref": "#/$defs/newsSentiment" },
    "businessRisks": {
      "type": "array",
      "items": { "$ref": "#/$defs/riskItem" }
    },
    "competitiveAdvantages": {
      "type": "array",
      "items": { "$ref": "#/$defs/advantageItem" }
    },
    "competitorAnalysis": {
      "type": "array",
      "items": { "$ref": "#/$defs/competitorItem" }
    },
    "swot": { "$ref": "#/$defs/swot" },
    "pros": { "type": "array", "items": { "type": "string" } },
    "cons": { "type": "array", "items": { "type": "string" } },
    "investmentScore": { "type": "number", "minimum": 0, "maximum": 100 },
    "confidence": { "type": "number", "minimum": 0, "maximum": 100 },
    "decisionBand": {
      "type": "string",
      "enum": ["INVEST", "CONSIDER", "PASS"]
    },
    "recommendation": {
      "type": "string",
      "enum": ["INVEST", "PASS"]
    },
    "reasoning": {
      "type": "array",
      "items": { "$ref": "#/$defs/reasoningItem" }
    },
    "sources": {
      "type": "array",
      "items": { "$ref": "#/$defs/sourceItem" }
    },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false,
  "$defs": {
    "metric": {
      "type": "object",
      "required": ["value", "unit", "period"],
      "properties": {
        "value": { "type": ["number", "string", "null"] },
        "unit": { "type": "string" },
        "period": { "type": "string" },
        "trend": { "type": "string", "enum": ["up", "down", "flat", "mixed", "unknown"] },
        "commentary": { "type": "string" },
        "sourceIds": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    },
    "newsItem": {
      "type": "object",
      "required": ["title", "source", "url", "publishedAt", "summary", "sentiment", "relevanceScore"],
      "properties": {
        "title": { "type": "string" },
        "source": { "type": "string" },
        "url": { "type": "string" },
        "publishedAt": { "type": "string", "format": "date-time" },
        "summary": { "type": "string" },
        "sentiment": { "type": "string", "enum": ["positive", "neutral", "negative"] },
        "relevanceScore": { "type": "number", "minimum": 0, "maximum": 100 }
      },
      "additionalProperties": false
    },
    "newsSentiment": {
      "type": "object",
      "required": ["overall", "score", "rationale", "sampleCount"],
      "properties": {
        "overall": { "type": "string", "enum": ["positive", "neutral", "negative", "mixed"] },
        "score": { "type": "number", "minimum": 0, "maximum": 100 },
        "rationale": { "type": "string" },
        "sampleCount": { "type": "integer", "minimum": 0 }
      },
      "additionalProperties": false
    },
    "riskItem": {
      "type": "object",
      "required": ["risk", "severity", "impact"],
      "properties": {
        "risk": { "type": "string" },
        "severity": { "type": "string", "enum": ["low", "medium", "high"] },
        "impact": { "type": "string" },
        "mitigation": { "type": "string" }
      },
      "additionalProperties": false
    },
    "advantageItem": {
      "type": "object",
      "required": ["advantage", "evidence", "impact"],
      "properties": {
        "advantage": { "type": "string" },
        "evidence": { "type": "string" },
        "impact": { "type": "string" }
      },
      "additionalProperties": false
    },
    "competitorItem": {
      "type": "object",
      "required": ["company", "whyRelevant", "comparisonSummary"],
      "properties": {
        "company": { "type": "string" },
        "ticker": { "type": ["string", "null"] },
        "whyRelevant": { "type": "string" },
        "comparisonSummary": { "type": "string" }
      },
      "additionalProperties": false
    },
    "swotPoint": {
      "type": "object",
      "required": ["point", "evidence", "implication"],
      "properties": {
        "point": { "type": "string" },
        "evidence": { "type": "string" },
        "implication": { "type": "string" }
      },
      "additionalProperties": false
    },
    "swot": {
      "type": "object",
      "required": ["strengths", "weaknesses", "opportunities", "threats"],
      "properties": {
        "strengths": { "type": "array", "items": { "$ref": "#/$defs/swotPoint" } },
        "weaknesses": { "type": "array", "items": { "$ref": "#/$defs/swotPoint" } },
        "opportunities": { "type": "array", "items": { "$ref": "#/$defs/swotPoint" } },
        "threats": { "type": "array", "items": { "$ref": "#/$defs/swotPoint" } }
      },
      "additionalProperties": false
    },
    "reasoningItem": {
      "type": "object",
      "required": ["step", "explanation"],
      "properties": {
        "step": { "type": "string" },
        "explanation": { "type": "string" },
        "evidenceRefs": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    },
    "sourceItem": {
      "type": "object",
      "required": ["name", "type", "url", "accessedAt"],
      "properties": {
        "name": { "type": "string" },
        "type": { "type": "string", "enum": ["financial", "news", "web", "analyst", "other"] },
        "url": { "type": "string" },
        "accessedAt": { "type": "string", "format": "date-time" },
        "note": { "type": "string" }
      },
      "additionalProperties": false
    }
  }
}
```

## Example Output Shape
```json
{
  "schemaVersion": "1.0.0",
  "company": "Infosys",
  "ticker": "INFY",
  "industry": "IT Services",
  "sector": "Technology",
  "headquarters": "Bengaluru, India",
  "founded": "1981",
  "ceo": "Salil Parekh",
  "employees": 343234,
  "businessSummary": "Global IT services and consulting provider.",
  "financialHighlights": {
    "revenue": { "value": 12000000000, "unit": "USD", "period": "TTM", "trend": "up" },
    "netIncome": { "value": 2500000000, "unit": "USD", "period": "TTM", "trend": "up" },
    "eps": { "value": 4.12, "unit": "USD/share", "period": "TTM", "trend": "up" },
    "marketCap": { "value": 150000000000, "unit": "USD", "period": "current" },
    "peRatio": { "value": 28.4, "unit": "x", "period": "current" },
    "debtToEquity": { "value": 0.31, "unit": "x", "period": "current" },
    "roe": { "value": 18.7, "unit": "%", "period": "TTM" },
    "profitMargin": { "value": 21.3, "unit": "%", "period": "TTM" },
    "revenueGrowth": { "value": 12.8, "unit": "%", "period": "YoY" },
    "cashFlow": { "value": 3800000000, "unit": "USD", "period": "TTM", "trend": "up" }
  },
  "latestNews": [],
  "newsSentiment": { "overall": "positive", "score": 74, "rationale": "Most recent coverage is constructive.", "sampleCount": 7 },
  "businessRisks": [],
  "competitiveAdvantages": [],
  "competitorAnalysis": [],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "pros": ["Strong cash generation"],
  "cons": ["Moderating revenue growth"],
  "investmentScore": 82,
  "confidence": 91,
  "decisionBand": "INVEST",
  "recommendation": "INVEST",
  "reasoning": [],
  "sources": [],
  "timestamp": "2026-07-12T14:30:00Z"
}
```

# Scoring Algorithm

## Scoring Principle
The investment score is a weighted, explainable score from 0 to 100.
A higher score means the company is more attractive on the available evidence.

## Weighted Components
The total score must be computed from six components:

- Financial Health: 30
- Growth: 20
- Valuation: 15
- News Sentiment: 15
- Competitive Position: 10
- Risk: 10

Total = 100

## How Each Component Is Scored

### 1. Financial Health (30 points)
This category measures profitability, balance sheet quality, and cash generation.

Signals used:
- Net income trend.
- Profit margin.
- Return on equity.
- Debt to equity.
- Cash flow.

Scoring guidance:
- Strong and improving profitability, positive cash flow, and low leverage should score near 100 in this category.
- Mixed profitability or moderate leverage should score in the middle.
- Persistent losses, weak cash flow, and high leverage should score low.

Suggested internal interpretation:
- 90 to 100: very strong financial health.
- 70 to 89: healthy.
- 40 to 69: mixed.
- 0 to 39: weak.

### 2. Growth (20 points)
This category measures whether the business is expanding.

Signals used:
- Revenue growth.
- EPS growth when available.
- Trend consistency over recent periods.

Scoring guidance:
- High and stable growth should score high.
- Flat or decelerating growth should score mid-range.
- Negative growth or contraction should score low.

### 3. Valuation (15 points)
This category measures whether the business is expensive relative to its fundamentals.

Signals used:
- P/E ratio.
- Growth-adjusted valuation context.
- Reasonableness relative to peers or the business quality.

Scoring guidance:
- Attractive valuation relative to growth should score high.
- Fair valuation should score mid-range.
- Excessive valuation without supporting growth should score low.

Important note:
- A low P/E is not automatically good.
- A high P/E is not automatically bad.
- The score must consider growth, quality, and peer context.

### 4. News Sentiment (15 points)
This category measures near-term market and business narrative.

Signals used:
- Tone of recent news.
- Earnings headlines.
- Regulatory or litigation headlines.
- Product or expansion announcements.

Scoring guidance:
- Mostly positive, high-relevance news should score high.
- Mixed coverage should score mid-range.
- Negative or uncertain coverage should score low.

### 5. Competitive Position (10 points)
This category measures durability and moat.

Signals used:
- Brand strength.
- Switching costs.
- Scale.
- Network effects.
- Customer retention.
- Market leadership.

Scoring guidance:
- Clear moat or market leadership should score high.
- Average competitive position should score mid-range.
- Weak differentiation should score low.

### 6. Risk (10 points)
This category measures downside exposure.

Signals used:
- Regulatory risk.
- Customer concentration.
- Geographic concentration.
- Cyclicality.
- Balance sheet stress.
- Litigation or governance issues.

Scoring guidance:
- Low risk should score high.
- Medium risk should score mid-range.
- High risk should score low.

## Final Score Formula
A simple weighted average should be used:
- Final Score = sum(componentScore x componentWeight).
- Each componentScore must itself be normalized to 0 to 100.
- The final score must also be clipped to 0 to 100.

## Score Interpretation
- 80 to 100: Strong investment case.
- 60 to 79: Mixed or watchlist case.
- 0 to 59: Weak investment case.

## Hard Score Overrides
The score should be capped or reduced when severe red flags exist:
- Fraud allegations with credible evidence.
- Ongoing insolvency or going-concern risk.
- Material negative cash flow with deteriorating fundamentals.
- Delisting or trading suspension risk.
- Major unresolved legal or regulatory events.

These events should prevent the report from sounding overly bullish.

# Confidence Algorithm

## Confidence Principle
Confidence is not the same as attractiveness.
A company can be attractive but low-confidence if the available data is weak.

Confidence must also be a number from 0 to 100.

## Confidence Inputs
The confidence score should reflect:
- Data completeness.
- Data recency.
- Source quality.
- Cross-source agreement.
- Company identity certainty.
- Output consistency.

## Suggested Weights
- Data completeness: 35
- Data recency: 20
- Source quality: 15
- Cross-source agreement: 20
- Identity certainty: 10

Total = 100

## Confidence Rules
- High completeness, recent data, and agreement across reputable sources should produce high confidence.
- Sparse data, stale data, or conflicting information should lower confidence.
- If the company name is ambiguous, confidence must be reduced.
- If the model cannot verify the ticker or financials, confidence must be reduced.

## Confidence Interpretation
- 85 to 100: Very high confidence.
- 70 to 84: High confidence.
- 50 to 69: Moderate confidence.
- 0 to 49: Low confidence.

## Confidence Caps
The confidence score should be capped when:
- Only one strong source is available.
- Financial data is stale.
- News coverage is sparse.
- The company is private and financial metrics are limited.
- The AI had to infer too much from indirect evidence.

# Recommendation Logic

## Recommendation Bands
Use a three-band decision band to preserve nuance:
- 80 to 100: INVEST
- 60 to 79: CONSIDER
- 0 to 59: PASS

## Why Three Bands
A binary yes/no output hides important nuance.
A three-band output is more useful for users because it separates:
- Strong buy cases.
- Borderline cases.
- Weak cases.

## Final Decision Rules
The final binary recommendation should be determined from the score band, then adjusted for blocking risks and confidence.

Base logic:
- If score is 80 or higher, decisionBand is INVEST.
- If score is between 60 and 79, decisionBand is CONSIDER.
- If score is below 60, decisionBand is PASS.

Adjustment logic:
- If confidence is below 50, the model should avoid a strong positive tone even if the score is high.
- If any hard override condition is present, recommendation must be PASS.
- If the company is too ambiguous to identify reliably, recommendation must be PASS.

Binary mapping:
- recommendation = INVEST only when decisionBand is INVEST, confidence is at least 70, and no hard override applies.
- recommendation = PASS for decisionBand values of CONSIDER or PASS.

## Final Recommendation Narrative
The recommendation must always be accompanied by:
- A short reason.
- The main upside drivers.
- The main risks.
- The most important sources.

## Relationship Between Score and Recommendation
- Score measures investment attractiveness.
- Confidence measures reliability of the analysis.
- decisionBand shows the transparent score outcome.
- recommendation is the final binary action.
- Recommendation combines both with hard risk overrides.

# Edge Cases

## Private Companies
- If the company is private, market metrics may be missing.
- Return null for unavailable public-market fields.
- Lower confidence if no reliable financials exist.

## Ambiguous Company Names
- If multiple companies match the name, choose the most likely match.
- If ambiguity remains, mark confidence lower and explain the assumption.

## Newly Listed Companies
- Recent IPOs may have limited history.
- Use available data but reduce confidence where historical data is thin.

## Missing Metrics
- Do not invent revenue, EPS, or market cap.
- Use null and explain the gap in reasoning.

## Conflicting Sources
- Prefer newer and more authoritative sources.
- If conflict remains unresolved, mention it in reasoning and lower confidence.

## Negative or Distressed Companies
- If the company has severe financial stress, the model should explicitly surface this.
- The report should not overstate upside in the presence of clear distress.

## Sparse News Coverage
- If recent news is limited, news sentiment should reflect low sample size.
- Confidence should drop accordingly.

## Non-English or Regional Companies
- Use translated or normalized summaries only if the source is credible.
- Preserve the original company identity when possible.

## Data Provider Failure
- If one provider fails, continue with partial analysis.
- Record the limitation in sources or reasoning.

# Future Enhancements

- Add citations inline at the sentence level.
- Add charts for revenue, profit, and valuation trends.
- Add watchlists and saved companies.
- Add comparison mode for two or more companies.
- Add portfolio-fit analysis.
- Add alerting when recommendation changes.
- Add export to PDF or shareable report links.
- Add historical backtesting of recommendations.
- Add sector-specific scoring adjustments.
- Add a human review mode for high-value analyses.
- Add multi-language support for non-English company research.
- Add richer source provenance and confidence breakdowns.
