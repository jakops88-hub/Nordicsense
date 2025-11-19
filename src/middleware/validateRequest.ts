import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { badRequest } from '../utils/apiError';

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        badRequest('Invalid request body', {
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        })
      );
    }
    req.body = parsed.data;
    return next();
  };
};
