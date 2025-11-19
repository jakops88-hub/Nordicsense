import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  OPENAI_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('60'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.string().default('info'),
  DEFAULT_SUMMARY_LENGTH: z.enum(['short', 'long']).default('short'),
  MAX_TEXT_LENGTH: z.string().default('20000'),
  ALLOWED_ANALYSIS_FEATURES: z.string().default(
    'full,sentiment,topics,keywords,summary,toxicity,entities'
  )
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const appConfig = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  port: Number(env.PORT),
  openAiApiKey: env.OPENAI_API_KEY,
  rateLimit: {
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
    maxRequests: Number(env.RATE_LIMIT_MAX_REQUESTS)
  },
  corsOrigin: env.CORS_ORIGIN,
  logLevel: env.LOG_LEVEL,
  defaultSummaryLength: env.DEFAULT_SUMMARY_LENGTH,
  maxTextLength: Number(env.MAX_TEXT_LENGTH),
  allowedAnalysisFeatures: env.ALLOWED_ANALYSIS_FEATURES.split(',')
    .map((feature) => feature.trim())
    .filter(Boolean)
};
