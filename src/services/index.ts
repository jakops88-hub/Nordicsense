import { OpenAiNlpProvider } from '../providers/OpenAiNlpProvider';
import { appConfig } from '../config/env';
import { TextAnalysisService } from './textAnalysisService';
import CacheService from './cacheService';
import { FullAnalysisResult } from '../types/analysis';
import piiService from './piiService';

const provider = new OpenAiNlpProvider(appConfig.openAiApiKey);

const cacheService = new CacheService<FullAnalysisResult>({
  max: appConfig.cache.maxItems,
  ttl: appConfig.cache.ttlMs
});

export const textAnalysisService = new TextAnalysisService(provider, cacheService, piiService);
