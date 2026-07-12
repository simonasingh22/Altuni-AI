# Project Story

## Why This Milestone Exists
This milestone creates the backend foundation before any AI or research features are added. That matters because a stable server structure makes every future milestone easier to build, explain, and verify.

## What We Built
We built a production-style Express backend skeleton with:
- Centralized environment loading and validation.
- A reusable logger.
- Standard response helpers.
- A consistent error system.
- Request middleware for IDs, logging, and error handling.
- A single health endpoint.
- Placeholder folders for the future AI pipeline.

## Why We Designed It This Way
The goal was to make the backend easy to scale without making it complicated too early. Each file has one job. That keeps the code readable and prevents the server from becoming a single large file later.

## What Problems It Solves
- It proves the backend can start and respond correctly.
- It creates a predictable structure for future APIs.
- It gives the AI work a place to plug in later.
- It makes debugging and validation easier.
- It sets up the project to look and feel production-ready from the beginning.

## Milestone 4 Story
This milestone adds the first real data source. The project now fetches financial information from Yahoo Finance and turns it into one normalized company object. That matters because later AI logic will need clean company data before it can reason about investment decisions.

What we built:
- A Yahoo Finance provider.
- A company research service.
- A `GET /api/company/:companyName` endpoint.
- Input validation, 404 handling, and 503 handling around the provider.

Why this design helps:
- The provider isolates external API work.
- The service keeps the route thin.
- The endpoint returns predictable JSON.

What it solves:
- It gives the project real company data.
- It keeps the backend ready for the next AI milestone.
- It avoids mixing Yahoo Finance details into route code.
