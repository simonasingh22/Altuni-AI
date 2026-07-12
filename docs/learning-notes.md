# Learning Notes

## What is Express?
Express is a small web framework for Node.js. It helps us create routes like `GET /api/health` without writing low-level server code by hand.

## Why Express?
It is simple, widely used, and easy to explain in interviews. It is a good fit for a clean backend foundation.

## What is React?
React is a frontend library for building user interfaces from reusable pieces called components.

## Why React?
It makes it easy to build a dashboard-style UI later, and it is a standard choice for modern web apps.

## What is Vite?
Vite is a modern frontend build tool. It starts fast and gives a smooth development experience.

## Why Vite?
It keeps the project lightweight and production-friendly.

## What is TailwindCSS?
Tailwind is a utility-first styling system. Instead of writing large CSS files, you compose styles with small class names.

## Why Tailwind?
It helps create a consistent UI quickly and keeps styles easy to manage.

## What is React Router?
React Router handles different pages inside a React app.

## Why React Router?
The final product will need routes like home, history, and analysis views.

## What is TanStack Query?
TanStack Query manages server data, caching, loading, and refetching.

## Why TanStack Query?
It simplifies future API fetching and loading states.

## What is Axios?
Axios is a library for making HTTP requests from the browser or backend.

## Why Axios?
It is easy to use and common in production React apps.

## What is Helmet?
Helmet adds security-related HTTP headers to the backend.

## Why Helmet?
It improves backend safety with very little setup.

## What is Morgan?
Morgan logs HTTP requests in the backend.

## Why Morgan?
It helps us see requests during development and debugging.

## What is Zod?
Zod is a validation library for checking that data matches a schema.

## Why Zod?
The AI output must be strict and predictable, so schema validation matters.

## Why does the shared folder exist?
It is for types and schemas that both frontend and backend can use later.

## Why does this file exist?
It helps explain the project in simple words during interviews.

## What is an Express app file?
The app file creates the web server setup. It decides which middleware runs first, which routes exist, and how errors are handled.

## Why separate app.js and server.js?
`app.js` builds the app. `server.js` starts it. This makes testing easier and keeps startup logic separate from request logic.

## What is environment loading?
Environment loading means reading values like port number and app name from `.env` files instead of hardcoding them.

## Why validate environment variables?
If a variable is missing or wrong, the server should fail immediately instead of starting in a broken state.

## What is Zod?
Zod is a tool that checks whether data matches the rules we define.

## Why use Zod for configuration?
It makes configuration safer because the app can check values before it starts.

## What is a logger?
A logger is a reusable way to write important messages like info, warnings, errors, and debug details.

## Why not use console.log everywhere?
Console logs are hard to control. A logger gives one standard place for messages and can later be improved without changing every file.

## What is a middleware?
Middleware is code that runs between the request coming in and the response going out.

## Why do we need middleware?
It helps add shared behavior like request IDs, logging, not-found handling, and error handling without repeating code.

## What is a request ID?
A request ID is a unique label for one request. It helps track a request through logs and errors.

## What is a custom error class?
A custom error class is a special error object with extra fields like status code and error code.

## Why use custom error classes?
They make error handling consistent and easier to debug.

## What is a response helper?
A response helper builds a consistent JSON response shape so the backend does not return random formats.

## Why use response helpers?
They keep the API predictable and reduce repeated response code.

## What is a controller?
A controller handles one request and decides what response should be sent.

## Why keep controllers small?
Small controllers are easier to read, test, and maintain.

## What is a route?
A route connects a URL like `/api/health` to the controller that should handle it.

## Why create placeholder provider and chain files now?
They reserve the structure for future AI and API work so the project can grow without reorganizing later.

## What is Yahoo Finance?
Yahoo Finance is a public source of company data like market cap, revenue, profit, and company details.

## Why use Yahoo Finance here?
It gives the app real financial data without building a full financial database from scratch.

## What is a provider?
A provider is a class that talks to one outside service.

## Why use a provider class?
It keeps Yahoo Finance code in one place, so the rest of the server stays simple.

## What is a service?
A service combines data from one or more providers and returns one clean result.

## Why use a service here?
The route should stay small. The service does the work of combining the data.

## What does normalization mean?
Normalization means turning messy provider data into one predictable shape.

## Why normalize data?
Because Yahoo Finance can return different fields or missing values for different companies.

## Why did we add a search ranking rule?
Short names like TCS can match more than one company, so we need logic that prefers the right ticker.

## Why does the endpoint return 404 sometimes?
If Yahoo Finance cannot find the company, the server should clearly say that the company was not found.

## Why does the endpoint return 503 sometimes?
If Yahoo Finance is unavailable, the server should say the upstream provider had a problem.

## What is dependency injection?
Dependency injection means passing a helper or client into a class instead of hardcoding it.

## Why use dependency injection here?
It makes the provider easier to test, especially for failure cases.
