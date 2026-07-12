# Debugging Journal

## Issue 1: Validation Middleware Mutated Read-Only Request Properties
- Root Cause: The generic validator tried to assign parsed data back to `request.query`.
- Fix: Store validated data on `request.validated` instead.
- Lesson Learned: Express request objects have framework-owned properties that should not be overwritten.

## Issue 2: Yahoo Search Returned the Wrong TCS Company
- Root Cause: The search ranking logic gave too much weight to long names that merely contained the acronym.
- Fix: Weight symbol matches more heavily than long-name matches for short queries.
- Lesson Learned: Acronym-style company names need ticker-first ranking.

## Issue 3: The Company Name Was Too Verbose
- Root Cause: The provider used a long business description as the company label.
- Fix: Prefer the canonical search result company name.
- Lesson Learned: Normalize the label separately from descriptive company text.

## Issue 4: Provider Failure Needed a Test Path
- Root Cause: The provider initially had no easy way to simulate upstream failures.
- Fix: Allow dependency injection of the Yahoo Finance client.
- Lesson Learned: External dependencies are easier to validate when they can be replaced in tests.

## Issue 5: Yahoo Finance Data Was Incomplete for Some Fields
- Root Cause: Yahoo does not always expose every field for every company.
- Fix: Return null for unavailable values and keep the response shape stable.
- Lesson Learned: Financial APIs often require graceful fallback handling.
