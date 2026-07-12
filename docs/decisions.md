# Decisions

## Decision 1: Keep the monorepo
- Why: One workspace keeps frontend, backend, and shared code aligned.
- Alternatives: Separate repositories.
- Trade-offs: Easier coordination, but the structure must stay disciplined.

## Decision 2: Keep React and Vite for the frontend
- Why: The assignment calls for a modern React foundation.
- Alternatives: Next.js or another framework.
- Trade-offs: Vite is lighter for this project and faster to explain.

## Decision 3: Use Express for the backend
- Why: It is simple, stable, and easy to scaffold cleanly.
- Alternatives: Fastify or NestJS.
- Trade-offs: Express is less opinionated, so we must enforce structure ourselves.

## Decision 4: Split app.js and server.js
- Why: The Express app should be separate from the process bootstrap logic.
- Alternatives: One combined file.
- Trade-offs: Two files add structure, but they make testing and shutdown handling cleaner.

## Decision 5: Validate environment variables with Zod
- Why: The app should fail fast if configuration is wrong.
- Alternatives: Manual checks or no validation.
- Trade-offs: Slightly more setup, much safer startup behavior.

## Decision 6: Use a reusable logger
- Why: Logging should be standardized across the backend.
- Alternatives: Direct console calls.
- Trade-offs: Slightly more abstraction, much better consistency.

## Decision 7: Add request IDs
- Why: Request IDs help trace a single request through logs and errors.
- Alternatives: No request correlation.
- Trade-offs: Minimal overhead, big debugging gain.

## Decision 8: Use response helpers
- Why: Response shapes should stay consistent.
- Alternatives: Manual response objects everywhere.
- Trade-offs: A little abstraction, less duplication.

## Decision 9: Create custom error classes
- Why: The API needs consistent error metadata.
- Alternatives: Plain Error objects.
- Trade-offs: More code up front, clearer error handling later.

## Decision 10: Keep provider and chain classes as placeholders
- Why: The architecture needs reserved boundaries before real AI logic exists.
- Alternatives: Build them early with fake logic.
- Trade-offs: The folders exist now, but the actual behavior will come later.

## Decision 11: Use yahoo-finance2 for Yahoo Finance access
- Why: It provides a direct server-side client for Yahoo Finance data.
- Alternatives: Build a scraper or use a different financial API.
- Trade-offs: The package is lightweight and practical, but Yahoo data can still be incomplete or ambiguous.

## Decision 12: Return raw normalized company JSON
- Why: The assignment asked for company data only, without wrapper metadata.
- Alternatives: Wrap the payload in a generic success response.
- Trade-offs: The endpoint is simpler for the next milestone, but response metadata stays out of band.

## Decision 13: Rank search results by symbol first
- Why: Short company names like TCS can map to multiple Yahoo results.
- Alternatives: Accept the first search result.
- Trade-offs: A little extra logic makes the result much more accurate for real users.

## Decision 14: Allow provider injection for testing
- Why: Failure handling needed to be testable without changing the route.
- Alternatives: Hardcode the Yahoo client inside the provider.
- Trade-offs: Constructor injection adds a small amount of structure, but it makes validation cleaner.
