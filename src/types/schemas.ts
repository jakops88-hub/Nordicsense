import { z } from 'zod';
import { appConfig } from '../config/env';

export const supportedLanguages = ['sv', 'no', 'da', 'fi', 'en'] as const;

export const analysisRequestSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(appConfig.maxTextLength, `Text must be below ${appConfig.maxTextLength} characters`),
  language: z.enum(supportedLanguages).optional(),
  summaryLength: z.enum(['short', 'long']).optional()
});

export type AnalysisRequestSchema = z.infer<typeof analysisRequestSchema>;
