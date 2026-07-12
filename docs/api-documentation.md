# API Documentation

## GET /api/health

### Purpose
Confirms the backend is running and ready.

### Method
GET

### Request
No request body is needed.

### Response
```json
{
  "status": "ok",
  "service": "AI Investment Research Agent",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-07-12T14:30:00.000Z"
}
```

### Success Rules
- Returns HTTP `200`.
- Uses the service name and version from environment validation.
- Returns the current runtime environment.
- Includes an ISO 8601 timestamp.

### Errors
- `400 Bad Request` if request validation fails.
- `404 Not Found` if another route is requested.
- `500 Internal Server Error` if the server cannot respond correctly.

### Example
A browser or frontend client can call this endpoint to confirm the backend is alive before any research feature is added.
This milestone intentionally exposes only this one endpoint.

## GET /api/company/:companyName

### Purpose
Fetches normalized Yahoo Finance company data for a requested company name.

### Method
GET

### Request
- `companyName` path parameter is required.
- Example: `/api/company/Apple`

### Response
```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "industry": "Consumer Electronics",
  "sector": "Technology",
  "marketCap": 4631217307648,
  "revenue": 416161000000,
  "netIncome": 112010000000,
  "profitMargin": 27.15,
  "cashFlow": 101090746368,
  "peRatio": 38.174335,
  "debtToEquity": 79.548,
  "roe": 1.4147099,
  "currentPrice": 315.32,
  "currency": "USD",
  "employees": 166000,
  "headquarters": "Cupertino, CA, United States",
  "ceo": "Mr. Timothy D. Cook",
  "founded": null
}
```

### Success Rules
- Returns HTTP `200`.
- Uses the company name validator before the provider runs.
- Returns only normalized company data.

### Errors
- `400 Bad Request` when the company name fails validation.
- `404 Not Found` when Yahoo Finance cannot find the company.
- `503 Service Unavailable` when Yahoo Finance is unavailable.

### Example
`/api/company/Infosys` returns normalized company fundamentals without any AI reasoning or investment recommendation.

## GET /api/company/:companyName/analyze

### Purpose
Triggers the full research gathering pipeline (Yahoo Finance fundamentals, Tavily Web Search, News API headlines) and prompts the Gemini LLM to synthesize a schema-validated investment memo report. It programmatically enforces decision bands, confidence score caps, and PASS/INVEST recommendations before returning the memo.

### Method
GET

### Request
- `companyName` path parameter is required.
- Example: `/api/company/Apple/analyze`

### Response
```json
{
  "company": "Apple Inc.",
  "ticker": "AAPL",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  "financialAnalysis": {
    "metrics": {
      "revenue": 383285000000,
      "revenueGrowth": 0.02,
      "ebitda": 125820000000,
      "ebitdaMargin": 0.328,
      "netIncome": 96996000000,
      "netProfitMargin": 0.253,
      "peRatio": 30.2,
      "forwardPeRatio": 28.5,
      "priceToBook": 45.3,
      "debtToEquity": 1.45,
      "operatingCashFlow": 110543000000,
      "freeCashFlow": 99543000000
    },
    "balanceSheetStrength": "strong",
    "growthTrajectory": "stable",
    "profitabilityMargins": "high",
    "cashFlowHealth": "healthy",
    "valuationAssessment": "fairly-valued"
  },
  "newsAnalysis": {
    "overallSentiment": "positive",
    "sentimentScore": 82,
    "significantEventsCount": 3,
    "marketReaction": "bullish"
  },
  "aiAnalysis": {
    "swot": {
      "strengths": ["Brand equity", "Ecosystem lock-in"],
      "weaknesses": ["Premium pricing dependence"],
      "opportunities": ["Generative AI integration"],
      "threats": ["Regulatory anti-trust scrutiny"]
    },
    "keyGrowthCatalysts": ["AI iPhone cycle", "Services growth"],
    "criticalRiskFactors": ["Regulatory actions", "Supply chain concentration"],
    "industryCompetitivePositioning": "Market leader in premium segment",
    "targetPriceValuationRange": {
      "low": 180,
      "high": 250,
      "base": 220
    }
  },
  "investmentScore": 85,
  "confidence": 80,
  "decisionBand": "INVEST",
  "recommendation": "INVEST",
  "explainableReasoning": {
    "rationale": "Apple exhibits strong financial metrics, cash flows, and brand value.",
    "keyDecisionFactors": ["Healthy cash flows", "High return on equity"],
    "riskMitigationMeasures": ["Diversifying supply chain"],
    "requiredInvestmentHorizon": "3-5 years"
  },
  "latestNews": [],
  "sources": [
    {
      "name": "Yahoo Finance API",
      "type": "financial",
      "url": "https://finance.yahoo.com",
      "accessedAt": "2026-07-12T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-07-12T10:30:00.000Z"
}
```

### Errors
- `400 Bad Request` if parameter validation fails.
- `502 Bad Gateway` if external LLM/API requests fail.

---

## GET /api/history

### Purpose
Retrieves a summary list of all successfully generated investment reports stored on the server's filesystem.

### Method
GET

### Response
```json
[
  {
    "id": "1689343949392-AAPL.json",
    "company": "Apple Inc.",
    "ticker": "AAPL",
    "recommendation": "INVEST",
    "investmentScore": 85,
    "timestamp": "2023-07-14T14:12:29.392Z"
  }
]
```

---

## GET /api/history/:id

### Purpose
Retrieves the full structured investment report payload for a specific past analysis by its filename ID.

### Method
GET

### Request
- `id` path parameter must match filename format `^\d+-[a-zA-Z0-9-]+\.json$`.

### Response
Returns the full JSON investment report payload (same shape as `/analyze` response).

### Errors
- `400 Bad Request` if the identifier format is invalid (directory traversal safeguard block).
- `404 Not Found` if the analysis record does not exist on disk.

