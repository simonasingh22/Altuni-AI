# Technical Debt

## Current Debt
- Yahoo Finance can still return incomplete fields such as founded or cash flow for some companies.
- Search disambiguation is heuristic-based and may need more aliases or market-specific tuning later.
- The logger uses console methods internally, which is acceptable for now but could later be replaced with a structured logging library.

## Resolved Debt
- **Chain Placeholder folders (Paid in Milestone 8)**: The placeholder chain classes were replaced with real implementations of `ResearchChain` and `InvestmentChain`. The service layer was refactored to delegate data ingress and model evaluations directly to these components.

## Why This Debt Is Acceptable
- This milestone is only about Yahoo Finance integration. Adding AI orchestration, more providers, and persistence now would blur the boundaries and make the next milestones harder to verify.

## What Should Be Done Later
- Add stronger ticker and alias resolution for ambiguous company names.

## Risk if Ignored
- If this debt is never paid, the project may return incomplete company data or choose the wrong company when a search term is ambiguous.
