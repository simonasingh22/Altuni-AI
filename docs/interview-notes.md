# Interview Notes

## Beginner Questions

### 1. Why did you add Yahoo Finance in Milestone 4?
Because the project needed its first real data source before any AI logic could be built.

### 2. Why use a provider class?
A provider keeps the Yahoo Finance integration in one place, which makes the code easier to maintain.

### 3. Why use a service layer?
The service combines provider responses and keeps the route and controller simple.

### 4. Why is the company endpoint separate from the health endpoint?
Health checks prove the server is alive. The company endpoint returns real company data.

### 5. Why return normalized data instead of raw Yahoo output?
Normalized data is easier for the next milestone to reuse.

### 6. Why do some fields return `null`?
Yahoo Finance does not always provide every field for every company.

### 7. Why does the app return 404 for unknown companies?
It is better to say the company was not found than to guess.

### 8. Why does the app return 400 for invalid input?
Bad input should fail before the provider runs.

### 9. Why does the app return 503 for Yahoo failures?
That tells us the problem is with the upstream provider, not with our API.

### 10. Why did you add dependency injection to the provider?
It makes failure testing easier and keeps the provider flexible.

## Intermediate Questions

### 1. Why did TCS need special ranking logic?
Yahoo Finance returned multiple matches for TCS, so the search ranker had to prefer the right ticker result.

### 2. Why did you rank symbol matches higher than long-name matches?
Short ticker-like queries usually mean the symbol is the best signal.

### 3. Why did the service use `Promise.allSettled`?
It lets the app keep partial data instead of failing the whole request because one field fetch failed.

### 4. Why did you keep the response wrapper out of this endpoint?
The assignment asked for only normalized company data, not extra metadata.

### 5. Why not put Yahoo logic in the controller?
Controllers should stay thin and only handle HTTP behavior.

### 6. Why not put Yahoo logic in the route file?
Route files should only connect URLs to handlers.

### 7. Why validate the company name in middleware?
That keeps invalid requests from reaching provider code.

### 8. Why is the provider allowed to throw custom errors?
It keeps error handling consistent and avoids exposing raw Yahoo exceptions.

### 9. Why did you keep the health route unchanged?
Milestone 4 is only for Yahoo Finance, so the existing health check had to stay stable.

### 10. Why is provider testing important?
External APIs can fail, and we need to know the app handles those failures cleanly.

## Advanced Questions

### 1. Why separate search, profile, quote, and statistics into individual provider methods?
Each method has one job, which makes the provider reusable and easier to test.

### 2. Why did you normalize the company label separately from the business description?
A company label should be short and canonical, while the business description can be long and detailed.

### 3. Why use a service to merge the results instead of letting the provider return one giant object?
The provider should fetch Yahoo data, while the service should decide how to combine the pieces.

### 4. Why is constructor injection better than hardcoding the Yahoo client?
It makes the class easier to test and easier to swap if the library ever changes.

### 5. Why did you choose yahoo-finance2?
It is a practical Node.js client for Yahoo Finance and fits the backend-only requirement well.

### 6. Why are you okay with some null financial fields?
Financial APIs often leave gaps, and forcing fake values would make the product less trustworthy.

### 7. Why did the TCS ranking fix matter for product quality?
Ambiguous searches are common in real usage, so choosing the wrong company would damage trust fast.

### 8. Why did you not add AI prompting or scoring yet?
This milestone is strictly about financial data retrieval, so adding AI would break the scope.

### 9. Why does the endpoint return raw JSON instead of a success envelope?
The assignment asked for only normalized company data, and the next milestone will consume that shape directly.

### 10. Why is this milestone important for the final AI product?
All future AI reasoning depends on having clean, trustworthy company data first.
