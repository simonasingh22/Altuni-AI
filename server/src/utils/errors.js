import { httpStatus } from './httpStatus.js';

export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);

    const {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR,
      errorCode = 'APP_ERROR',
      details = null,
      cause = undefined
    } = options;

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    if (cause !== undefined) {
      this.cause = cause;
    }

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, {
      statusCode: httpStatus.BAD_REQUEST,
      errorCode: 'VALIDATION_ERROR',
      details
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, {
      statusCode: httpStatus.NOT_FOUND,
      errorCode: 'NOT_FOUND',
      details
    });
  }
}

export class ExternalAPIError extends AppError {
  constructor(message = 'External API request failed', details = null) {
    super(message, {
      statusCode: httpStatus.BAD_GATEWAY,
      errorCode: 'EXTERNAL_API_ERROR',
      details
    });
  }
}

export class ConfigurationError extends AppError {
  constructor(message = 'Configuration is invalid', details = null) {
    super(message, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'CONFIGURATION_ERROR',
      details
    });
  }
}

export function isAppError(error) {
  return error instanceof AppError;
}
