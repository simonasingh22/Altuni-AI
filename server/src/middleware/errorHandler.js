import { NotFoundError, ValidationError, isAppError } from '../utils/errors.js';
import { httpStatus } from '../utils/httpStatus.js';
import { errorResponse, notFoundResponse, validationResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const requestId = request.requestId ?? null;

  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(
      validationResponse({
        message: error.message,
        details: error.details,
        requestId
      })
    );
  }

  if (error instanceof NotFoundError) {
    return response.status(httpStatus.NOT_FOUND).json(
      notFoundResponse({
        message: error.message,
        details: error.details,
        requestId
      })
    );
  }

  if (isAppError(error)) {
    logger.error(error.message, {
      requestId,
      errorCode: error.errorCode,
      details: error.details
    });

    return response.status(error.statusCode).json(
      errorResponse({
        message: error.message,
        errorCode: error.errorCode,
        details: error.details,
        requestId
      })
    );
  }

  logger.error('Unhandled server error', {
    requestId,
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    }
  });

  return response.status(httpStatus.INTERNAL_SERVER_ERROR).json(
    errorResponse({
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      details: null,
      requestId
    })
  );
}
