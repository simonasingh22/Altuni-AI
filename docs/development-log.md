# Development Log

## 2026-07-12
- Milestone Number: 1
- Files Created: `docs/product-spec.md`
- Files Modified: None
- Packages Installed: None
- Commands Executed: Workspace inspection and spec review commands only
- Problems Found: Binary recommendation conflicted with the requested INVEST/CONSIDER/PASS bands
- How They Were Solved: Separated the transparent score band from the final recommendation logic
- Why This Change Was Needed: The rest of the project needs a single unambiguous analysis contract

## 2026-07-12
- Milestone Number: 2
- Files Created: Root monorepo files, client scaffold, server scaffold, shared scaffold, documentation files
- Files Modified: `client/package.json`, `client/vite.config.ts`
- Packages Installed: React 19, React DOM, React Router, TanStack Query, Axios, Vite, TailwindCSS, TypeScript, ESLint, Prettier, Express, dotenv, cors, helmet, morgan, zod, LangChain, and lint support packages
- Commands Executed: `git init`, `npm install`, `npm run dev --workspace server`, `npm run dev --workspace client`, `Invoke-WebRequest http://localhost:4000/api/health`, `npm run lint`, `npm run build`
- Problems Found: LangChain 0.3.x conflicted with the resolved peer dependency tree; Vite ESM config also needed an explicit file URL based directory path
- How They Were Solved: Upgraded LangChain to the current 1.x line and used `fileURLToPath(import.meta.url)` with `path.dirname`
- Why This Change Was Needed: The project foundation must install, start, and verify cleanly before feature work begins
- Production Gate Verification: No TypeScript errors, no ESLint warnings or errors, no TODO/FIXME comments, build succeeded, health endpoint returned the expected JSON, and the frontend rendered only the required title

## 2026-07-12
- Milestone Number: 3
- Files Created: `server/src/config/environment.js`, `server/src/controllers/healthController.js`, `server/src/middleware/asyncHandler.js`, `server/src/middleware/errorHandler.js`, `server/src/middleware/notFoundHandler.js`, `server/src/middleware/requestId.js`, `server/src/middleware/requestLogger.js`, `server/src/routes/health.routes.js`, `server/src/routes/index.js`, `server/src/server.js`, `server/src/chains/research.chain.js`, `server/src/chains/investment.chain.js`, `server/src/providers/gemini.provider.js`, `server/src/providers/yahooFinance.provider.js`, `server/src/providers/news.provider.js`, `server/src/providers/tavily.provider.js`, `server/src/utils/constants.js`, `server/src/utils/errors.js`, `server/src/utils/httpStatus.js`, `server/src/utils/logger.js`, `server/src/utils/response.js`, `server/src/validators/companyName.validator.js`, `server/src/validators/generalRequest.validator.js`, `server/src/validators/health.validator.js`, `docs/project-story.md`, `docs/technical-debt.md`, `docs/llm-usage-log.md`
- Files Modified: `server/src/app.js`, `server/src/index.js`, `server/package.json`, `package.json`, `README.md`, `.env.example`, `server/.env.example`, `docs/architecture-notes.md`, `docs/api-documentation.md`, `docs/folder-explanation.md`, `docs/learning-notes.md`, `docs/interview-notes.md`, `docs/decisions.md`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: Workspace inspection, file creation, and code edits only so far
- Problems Found: The old Express scaffold and entry point were too minimal, the root/server scripts needed to point at the new server bootstrap, and the request validator initially tried to write back to `req.query`
- How They Were Solved: Replaced the scaffold with a modular Express foundation, added environment validation, logging, middleware, routes, and placeholder boundaries, then moved validated request data to `request.validated`
- Why This Change Was Needed: The backend needs a production-style skeleton before AI, providers, and business logic can be added safely

## 2026-07-12
- Milestone Number: 4
- Files Created: `server/src/controllers/companyController.js`, `server/src/providers/yahooFinance.provider.js`, `server/src/routes/company.routes.js`, `server/src/services/companyResearch.service.js`
- Files Modified: `server/src/routes/index.js`, `server/src/validators/companyName.validator.js`, `server/src/services/companyResearch.service.js`, `server/src/providers/yahooFinance.provider.js`, `server/package.json`, `package-lock.json`, `docs/api-documentation.md`, `docs/architecture-notes.md`, `docs/folder-explanation.md`, `docs/learning-notes.md`, `docs/project-story.md`, `docs/technical-debt.md`, `docs/llm-usage-log.md`, `docs/decisions.md`, `docs/progress.md`
- Packages Installed: `yahoo-finance2`
- Commands Executed: `npm install --workspace server yahoo-finance2`, `npm run lint`, `npm run build`, `npm run dev --workspace server`, `npm run dev --workspace client`, live endpoint checks for Apple, Microsoft, Tesla, Infosys, TCS, invalid input, unknown company, and direct provider failure simulation
- Problems Found: Yahoo search initially returned an unrelated TCS company, the company label was too descriptive, and the provider placeholder needed a real implementation
- How They Were Solved: Implemented a Yahoo Finance provider with input validation and custom errors, added a company research service, introduced a better ticker-first search ranking strategy, and normalized the route response
- Why This Change Was Needed: The project needed a real financial data source before AI, scoring, or recommendations could be added safely

## 2026-07-12
- Milestone Number: 5
- Files Created: `server/src/validators/companyAnalysis.schema.js`, `server/src/services/companyAnalysis.service.js`
- Files Modified: `server/src/prompts/investment.prompt.js`, `server/src/controllers/companyController.js`, `server/src/routes/company.routes.js`, `.env.example`, `server/.env.example`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, `Invoke-RestMethod` to verify `/api/health`, `/api/company/Apple`, and `/api/company/Apple/analyze`
- Problems Found: Linter flagged unused validation import in service; Gemini client requires API key to proceed but has fallback and programmatic post-processing to keep results contract-safe
- How They Were Solved: Removed unused import; added dummy key environment variables in example configurations to facilitate local setup, and wrote post-processing logic in `CompanyAnalysisService` to enforce scoring caps and pass/invest bands programmatically
- Why This Change Was Needed: Connecting the raw Yahoo Finance data with the LLM requires a structured analysis orchestration layer, prompt engineering, and strict validation to ensure the returned report conforms to the contract

## 2026-07-12
- Milestone Number: 6
- Files Created: `server/src/providers/tavily.provider.js`
- Files Modified: `server/src/config/environment.js`, `server/src/services/companyAnalysis.service.js`, `.env.example`, `server/.env.example`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, `Invoke-RestMethod` to verify `/api/company/Apple/analyze`
- Problems Found: Dummy keys caused 401 on Tavily and 400 on Gemini as expected, verifying the error response boundaries are properly wired.
- How They Were Solved: Implemented TavilyProvider wrapping search query results; added Tavily configuration keys to environment validation and config examples; integrated the search provider inside `CompanyAnalysisService` with error-handling fallback logic to ensure research continues even if search fails; adjusted the confidence score calculations to raise the score cap to 80 when web data is present.
- Why This Change Was Needed: Conducting high-quality investment analysis requires real-time web research, competitor signals, and market context beyond simple quantitative fundamentals, which Tavily search retrieves and supplies to the LLM.

## 2026-07-12
- Milestone Number: 8
- Files Created: `server/src/chains/research.chain.js`, `server/src/chains/investment.chain.js`
- Files Modified: `server/src/services/companyAnalysis.service.js`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, `Invoke-RestMethod` to verify `/api/company/Apple/analyze`
- Problems Found: None. Chain isolation validated successfully under 401 fallbacks and 400 LLM errors.
- How They Were Solved: Created `ResearchChain` to encapsulate multi-provider data-gathering and error fallbacks; created `InvestmentChain` to encapsulate prompt engineering, LLM query execution, JSON parsing/validation, and normalization scoring; refactored `CompanyAnalysisService` to coordinate calls cleanly via these two chains.
- Why This Change Was Needed: Modularizing the analysis pipeline into dedicated data ingestion (`ResearchChain`) and LLM evaluation (`InvestmentChain`) layers isolates concerns, resolves architectural placeholder code debt, and enhances code maintainability.

## 2026-07-12
- Milestone Number: 9
- Files Created: `client/src/services/api.ts`, `client/src/components/ReportVisualizer.tsx`
- Files Modified: `client/vite.config.ts`, `client/src/App.tsx`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, API proxy curl validation
- Problems Found: ESLint threw browser-environment compilation error on NodeJS type namespace references in React timers.
- How They Were Solved: Swapped NodeJS timer namespace type references with native `ReturnType<typeof setInterval>` in `App.tsx` effect blocks.
- Why This Change Was Needed: Connecting users with the underlying quantitative models requires an interactive search dashboard, rotating loading states for visual feedback, and clear gauges detailing target price bounds and score recommendations.

## 2026-07-12
- Milestone Number: 10
- Files Created: `server/src/services/history.service.js`, `server/src/controllers/historyController.js`, `server/src/routes/history.routes.js`
- Files Modified: `server/src/routes/index.js`, `server/src/controllers/companyController.js`, `client/src/services/api.ts`, `client/src/App.tsx`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, `Invoke-RestMethod` to verify `/api/history` list and GET `/api/history/:id` detail record retrieval
- Problems Found: None. File-system data validation regex maps tickers correctly and blocks path traversal attempts.
- How They Were Solved: Created `HistoryService` storing JSON report data on disk in `data/history/` at the root, registering Express routes at `/api/history`, updating `companyController` to save generated analyses, adding API client routines, and implementing a collapsible history sidebar panel in the React frontend.
- Why This Change Was Needed: Retaining past investment reports increases system usability by preventing redundant API/LLM calls, saving credits, and allowing instant historical analysis review.

## 2026-07-12
- Milestone Number: 11
- Files Created: `Dockerfile`, `docker-compose.yml`
- Files Modified: `server/src/app.js`, `package.json`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`, production boot verification check
- Problems Found: Express 5 routing throws error on '*' or '/*' catch-all string path syntax under updated `path-to-regexp` engines; client dist path resolved outside root due to incorrect level traversal.
- How They Were Solved: Changed the path resolution to go up 2 levels (`../../client/dist`); changed the wildcard catch-all route to a regex literal catch-all `/.*/` which is fully supported; added a production launch script in root `package.json`; wrote a multi-stage `Dockerfile` and a `docker-compose.yml` with history volume mounts.
- Why This Change Was Needed: Shipping a production-grade web application requires a unified deployment strategy (where a single server hosts both API routes and static client code) and container orchestration configurations.

## 2026-07-12
- Milestone Number: 12
- Files Created: None
- Files Modified: `docs/api-documentation.md`, `docs/technical-debt.md`, `docs/progress.md`
- Packages Installed: None
- Commands Executed: `npm run lint`, `npm run build`
- Problems Found: None.
- How They Were Solved: Updated API documentation to cover the new endpoints (`/analyze`, `/history`, `/history/:id`). Updated the technical debt registry to mark the placeholder chain folders debt as resolved (paid in Milestone 8) and added a new resolved section.
- Why This Change Was Needed: Conducting documentation audits and paying down technical debt registers ensures the repository transitions cleanly to a fully maintainable state, easing integration, handovers, and future development cycles.





