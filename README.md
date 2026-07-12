# AI Investment Research Agent

Monorepo scaffold for the InsideIIM × Altuni AI Labs take-home assignment.

## Structure
- `client/` React 19 + Vite frontend
- `server/` Node.js + Express backend
- `shared/` shared types and schemas
- `docs/` project documentation and planning notes

## Current Scope
- Milestone 1: product specification and analysis contract
- Milestone 2: production-ready project foundation and scaffolding
- Milestone 3: production-ready Express backend foundation

## Run
- Install dependencies: `npm install`
- Start frontend: `npm run dev:client`
- Start backend: `npm run dev:server`
- Build the project: `npm run build`
- Lint the project: `npm run lint`

## Environment Variables
Backend variables documented in `.env.example` and `server/.env.example`:
- `NODE_ENV`
- `PORT`
- `HOST`
- `APP_NAME`
- `APP_VERSION`
- `CORS_ORIGIN`
- `LOG_LEVEL`

Frontend variables documented in `client/.env.example`:
- `VITE_API_BASE_URL`

## Environment
Copy `.env.example` to `.env` files in the relevant packages when needed.

## Health Check
The backend exposes `GET /api/health` and returns the service name, version, environment, and timestamp.
