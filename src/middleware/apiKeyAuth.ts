import type { RequestHandler } from 'express';
import { appConfig } from '../config/env';
import { ApiError } from '../utils/apiError';

const extractKey = (headerValue?: string | string[]) => {
  if (!headerValue) return undefined;
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (!value) return undefined;
  if (value.startsWith('Bearer ')) {
    return value.slice(7).trim();
  }
  return value.trim();
};

export const apiKeyAuth: RequestHandler = (req, _res, next) => {
  if (!appConfig.apiKeys.length) {
    return next();
  }

  const headerKey = extractKey(req.header('x-api-key'));
  const authHeaderKey = extractKey(req.header('authorization'));
  const providedKey = headerKey ?? authHeaderKey;

  if (!providedKey || !appConfig.apiKeys.includes(providedKey)) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Valid API key required'));
  }

  return next();
};
