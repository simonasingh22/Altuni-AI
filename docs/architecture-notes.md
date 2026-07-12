# Architecture Notes

## Overall Architecture
The project uses a monorepo with three main parts:
- `client/` for the React app
- `server/` for the Express API
- `shared/` for shared types and schemas

The backend now follows a layered Express structure:
- `config/` loads and validates environment variables.
- `middleware/` handles request IDs, logging, 404s, and errors.
- `routes/` maps URLs to controllers.
- `controllers/` returns HTTP responses.
- `utils/` holds reusable building blocks like errors, status codes, and response helpers.
- `providers/` and `chains/` exist as reserved boundaries for later AI work.

Milestone 4 adds the first live data path:
- Request enters `GET /api/company/:companyName`.
- The route validates the company name.
- The controller passes the request to the company research service.
- The service coordinates the Yahoo Finance provider.
- The provider searches Yahoo Finance, fetches financial details, and normalizes the results.
- The service merges the values into one clean JSON object.
- The controller returns that object directly.

## Request Flow
1. The browser loads the React app.
2. The user will later submit a company name.
3. The frontend will call the backend API.
4. The backend validates the request, adds a request ID, and logs the request.
5. The company endpoint uses the Yahoo Finance provider and service layer.
6. The controller returns normalized JSON.
7. The frontend will render the response later.

## Response Flow
The backend now exposes two endpoints:
- `GET /api/health`
- `GET /api/company/:companyName`

`/api/health` returns service status, and `/api/company/:companyName` returns normalized Yahoo Finance data.

Errors flow through a global error handler so every failure uses a consistent JSON shape.

## Folder Responsibilities
- `client/src/components/` will hold reusable UI pieces.
- `client/src/pages/` will hold page-level screens later.
- `server/src/app.js` builds and configures the Express app.
- `server/src/server.js` starts the HTTP server and handles shutdown.
- `server/src/routes/` will hold API route definitions.
- `server/src/controllers/` will hold request handlers.
- `server/src/services/` will hold logic for data fetching and transformation.
- `server/src/services/companyResearch.service.js` coordinates provider calls and response normalization.
- `server/src/chains/` will hold LangChain orchestration later.
- `server/src/prompts/` will hold AI prompt templates later.
- `server/src/middleware/` will hold reusable Express middleware.
- `server/src/config/` will hold configuration and environment setup.
- `server/src/validators/` will hold request validation schemas.
- `server/src/providers/` will hold provider integration classes later.
- `server/src/providers/yahooFinance.provider.js` now contains the live Yahoo Finance integration.
- `shared/src/` will hold reusable shared code.

## Why This Architecture Was Chosen
This structure keeps code separated by purpose. That makes the project easier to explain, easier to test, and easier to expand without creating giant files. It also keeps AI code isolated from HTTP code so future changes stay safer. The Yahoo Finance integration is isolated behind a provider and a service so later providers can be swapped in without rewriting the route.

## Frontend Flow
Right now the frontend only shows the product name. Later it will become the dashboard for research results.

## Backend Flow
Right now the backend loads configuration, creates the Express app, attaches middleware, registers routes, and returns the health and company data responses. Later it will orchestrate research, validation, and AI output.

## Data Flow
Shared types will later keep the frontend and backend aligned on the same response shape. For now, the backend foundation is deliberately light so the API contract stays stable before the AI workflow is introduced. The Yahoo Finance service currently normalizes provider output into plain JSON so the next milestone can reuse the data without extra transformation.
