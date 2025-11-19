import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/env';
import { tooManyRequests } from '../utils/apiError';

export const rateLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(tooManyRequests('Rate limit exceeded'));
  }
});
