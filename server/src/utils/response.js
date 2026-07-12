import { APP_NAME, APP_VERSION } from './constants.js';

function buildBaseResponse({ success, message, requestId, details = null }) {
  return {
    success,
    service: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    requestId,
    message,
    details
  };
}

export function successResponse({ message = 'OK', data = null, requestId = null } = {}) {
  return {
    ...buildBaseResponse({ success: true, message, requestId }),
    data
  };
}

export function errorResponse({ message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR', details = null, requestId = null } = {}) {
  return {
    ...buildBaseResponse({ success: false, message, requestId, details }),
    errorCode
  };
}

export function validationResponse({ message = 'Validation failed', details = null, requestId = null } = {}) {
  return errorResponse({
    message,
    errorCode: 'VALIDATION_ERROR',
    details,
    requestId
  });
}

export function notFoundResponse({ message = 'Resource not found', details = null, requestId = null } = {}) {
  return errorResponse({
    message,
    errorCode: 'NOT_FOUND',
    details,
    requestId
  });
}
