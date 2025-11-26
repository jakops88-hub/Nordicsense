import { z } from 'zod';
import { appConfig } from '../config/env';

export const supportedLanguages = ['sv', 'no', 'da', 'fi', 'en'] as const;

export const analysisRequestSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(appConfig.maxTextLength, `Text must be below ${appConfig.maxTextLength} characters`),
  language: z.enum(supportedLanguages).optional(),
  summaryLength: z.enum(['short', 'long']).optional(),
  anonymize: z.boolean().optional(),
});

export const analysisBatchRequestSchema = z.object({
  items: z
    .array(analysisRequestSchema)
    .min(1, 'At least one item is required.')
    .max(50, 'A maximum of 50 items can be processed in a batch.'),
});


export type AnalysisRequestSchema = z.infer<typeof analysisRequestSchema>;
export type AnalysisBatchRequestSchema = z.infer<typeof analysisBatchRequestSchema>;
