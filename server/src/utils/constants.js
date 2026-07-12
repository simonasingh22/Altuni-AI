export const APP_NAME = 'AI Investment Research Agent';
export const APP_VERSION = '1.0.0';
export const DEFAULT_PORT = 4000;
export const DEFAULT_HOST = '0.0.0.0';
export const DEFAULT_ENVIRONMENT = 'development';
export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';
export const HEALTH_ROUTE = '/api/health';
export const REQUEST_ID_HEADER = 'x-request-id';

export const LOG_LEVELS = Object.freeze(['debug', 'info', 'warn', 'error']);

export const HTTP_METHODS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
});
