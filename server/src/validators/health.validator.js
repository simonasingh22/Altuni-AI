import { z } from 'zod';
import { validateRequest } from './generalRequest.validator.js';

export const healthQuerySchema = z.object({}).strict();
export const healthParamsSchema = z.object({}).strict();
export const healthBodySchema = z.object({}).strict();

export const validateHealthRequest = validateRequest(healthQuerySchema, 'query');
