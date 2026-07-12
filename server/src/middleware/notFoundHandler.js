import { NotFoundError } from '../utils/errors.js';

export function notFoundHandler(request, response, next) {
  next(
    new NotFoundError(`Route not found: ${request.method} ${request.originalUrl}`, {
      path: request.originalUrl,
      method: request.method
    })
  );
}
