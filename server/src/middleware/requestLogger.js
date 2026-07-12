import { logger } from '../utils/logger.js';

export function requestLogger(request, _response, next) {
  request.requestStartedAt = Date.now();
  logger.debug('Incoming request', {
    requestId: request.requestId,
    method: request.method,
    path: request.originalUrl
  });
  next();
}
