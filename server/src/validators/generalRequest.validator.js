import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const requestMetadataSchema = z.object({
  requestId: z.string().min(1).optional(),
  timestamp: z.string().datetime().optional()
});

export function validateRequest(schema, source = 'body') {
  return function requestValidator(request, _response, next) {
    const parsedResult = schema.safeParse(request[source]);

    if (!parsedResult.success) {
      return next(new ValidationError('Request validation failed', parsedResult.error.flatten()));
    }

    request.validated = request.validated ?? {};
    request.validated[source] = parsedResult.data;
    return next();
  };
}
