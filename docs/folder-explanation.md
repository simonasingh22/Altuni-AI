# Folder Explanation

## client/
Contains the React frontend application.

## client/src/
Main source code for the frontend.

## client/src/components/
Reusable UI components that can be shared across pages.

## client/src/pages/
Page-level screens. This stays empty for Milestone 2.

## client/src/layouts/
Layout wrappers for shared page structure.

## client/src/hooks/
Custom React hooks for shared UI logic.

## client/src/api/
Frontend API helper functions.

## client/src/services/
Frontend service modules for data access.

## client/src/utils/
Small helper functions used by the frontend.

## client/src/styles/
Global and shared style resources.

## client/src/routes/
Route definitions for the app.

## client/src/types/
Frontend-only TypeScript types.

## server/
Contains the Express backend.

## server/src/
Main source code for the backend.

## server/src/app.js
Builds the Express app, attaches middleware, registers routes, and exports the configured app.

## server/src/server.js
Starts the HTTP server and handles graceful shutdown.

## server/src/config/
Configuration and environment setup.

## server/src/config/environment.js
Loads `.env` files, validates variables with Zod, and fails fast when configuration is invalid.

## server/src/controllers/
Request handlers for routes.

## server/src/controllers/companyController.js
Handles the company research endpoint and returns normalized company data.

## server/src/controllers/healthController.js
Returns the health response.

## server/src/routes/
API route definitions.

## server/src/routes/company.routes.js
Defines the company research route under `/api/company`.

## server/src/routes/health.routes.js
Defines the `GET /api/health` route.

## server/src/routes/index.js
Combines API routes under the `/api` prefix.

## server/src/services/
Business and integration service modules.

## server/src/services/companyResearch.service.js
Coordinates Yahoo Finance provider calls and merges the results into one clean object.

## server/src/chains/
LangChain orchestration will live here later.

## server/src/chains/research.chain.js
Placeholder for future research orchestration.

## server/src/chains/investment.chain.js
Placeholder for future investment decision orchestration.

## server/src/prompts/
AI prompt templates will live here later.

## server/src/providers/
External API client wrappers will live here later.

## server/src/providers/yahooFinance.provider.js
Fetches and normalizes data from Yahoo Finance.

## server/src/providers/*.provider.js
Placeholder classes for future external integrations.

## server/src/middleware/
Reusable Express middleware.

## server/src/middleware/requestId.js
Adds a request ID to every request and response.

## server/src/middleware/requestLogger.js
Stores request metadata for logging.

## server/src/middleware/notFoundHandler.js
Turns missing routes into a standard 404 error.

## server/src/middleware/errorHandler.js
Converts errors into a consistent JSON response.

## server/src/middleware/asyncHandler.js
Wraps async route handlers so errors reach the global error handler.

## server/src/validators/
Input validation schemas.

## server/src/validators/companyName.validator.js
Validates company names for future research endpoints.

## server/src/validators/generalRequest.validator.js
Reusable validation helper for request data.

## server/src/validators/health.validator.js
Validates the health route request shape.

## server/src/utils/
Helper functions shared across backend modules.

## server/src/utils/constants.js
Central place for shared values like app name, version, and route names.

## server/src/utils/httpStatus.js
Named HTTP status codes and status text helpers.

## server/src/utils/response.js
Reusable response builders for success and error payloads.

## server/src/utils/errors.js
Custom error classes with HTTP status, error codes, and details.

## server/src/utils/logger.js
Reusable logging utility used across the server.

## server/src/models/
Data models or persistence adapters if needed later.

## server/src/providers/gemini.provider.js, news.provider.js, tavily.provider.js
Placeholders for future provider integrations.

## server/src/types/
Backend TypeScript types.

## shared/
Shared code used by both frontend and backend.

## shared/src/
Shared source code.

## shared/schemas/
Shared schema definitions.

## shared/types/
Shared TypeScript types.

## docs/
Project documentation used to explain the assignment and implementation decisions.
