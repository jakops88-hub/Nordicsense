import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { logger } from '../config/logger';
import { appConfig } from '../config/env';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let errorResponse: ApiError;

  if (err instanceof ApiError) {
    errorResponse = err;
  } else {
    const message = err instanceof Error ? err.message : 'Internal server error';
    errorResponse = new ApiError(500, 'INTERNAL_ERROR', message);
  }

  if (errorResponse.statusCode >= 500) {
    logger.error(
      {
        err: appConfig.isProduction ? undefined : err,
        path: req.path,
        method: req.method,
        status: errorResponse.statusCode
      },
      'Unhandled error'
    );
  } else {
    logger.warn(
      {
        path: req.path,
        method: req.method,
        status: errorResponse.statusCode,
        details: errorResponse.details
      },
      'API error'
    );
  }

  res.status(errorResponse.statusCode).json({
    error: {
      code: errorResponse.code,
      message: appConfig.isProduction && errorResponse.statusCode >= 500 ? 'Internal server error' : errorResponse.message,
      details: errorResponse.details ?? {}
    }
  });
};
