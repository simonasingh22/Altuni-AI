import { z } from 'zod';
import { validateRequest } from './generalRequest.validator.js';

export const companyNameSchema = z
  .string()
  .trim()
  .min(2, 'Company name must be at least 2 characters long')
  .max(120, 'Company name must be 120 characters or fewer')
  .regex(/^[\p{L}\p{N}.,&'()/\s-]+$/u, 'Company name contains invalid characters');

export const companyNameQuerySchema = z.object({
  companyName: companyNameSchema
});

export const validateCompanyNameQuery = validateRequest(companyNameQuerySchema, 'query');

export const companyNameParamsSchema = z.object({
  companyName: companyNameSchema
});

export const validateCompanyNameParams = validateRequest(companyNameParamsSchema, 'params');
