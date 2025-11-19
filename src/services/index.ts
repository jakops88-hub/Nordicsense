import { OpenAiNlpProvider } from '../providers/OpenAiNlpProvider';
import { appConfig } from '../config/env';
import { TextAnalysisService } from './textAnalysisService';

const provider = new OpenAiNlpProvider(appConfig.openAiApiKey);

export const textAnalysisService = new TextAnalysisService(provider);
