import type { RequestHandler } from 'express';
import { appConfig } from '../config/env';
import { ApiError } from '../utils/apiError';
import type { AnalysisFeature } from '../types/analysis';

export const createFeatureGate = (feature: AnalysisFeature): RequestHandler => {
  return (_req, _res, next) => {
    const allowed = appConfig.allowedAnalysisFeatures.includes(feature);
    if (!allowed) {
      return next(new ApiError(403, 'FEATURE_DISABLED', `${feature} analysis is disabled`));
    }
    return next();
  };
};
