import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '../utils/constants.js';

export function requestIdMiddleware(request, response, next) {
  const incomingRequestId = request.get(REQUEST_ID_HEADER);
  const requestId = incomingRequestId || randomUUID();

  request.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
