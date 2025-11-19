import OpenAI from 'openai';
import { z } from 'zod';
import { NlpProvider } from './NlpProvider';
import {
  AnalysisRequest,
  KeywordExtractionResult,
  NamedEntityResult,
  SentimentResult,
  SummaryResult,
  SupportedLanguage,
  TopicClassificationResult,
  ToxicityResult
} from '../types/analysis';
import { ApiError } from '../utils/apiError';

const DEFAULT_MODEL = 'gpt-4o-mini';

export class OpenAiNlpProvider implements NlpProvider {
  public readonly name = 'openai';
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new ApiError(500, 'PROVIDER_INIT_ERROR', 'OPENAI_API_KEY is not configured');
    }
    this.client = new OpenAI({ apiKey });
  }

  private async runStructuredTask<T>(systemPrompt: string, userPrompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new ApiError(502, 'PROVIDER_RESPONSE_EMPTY', 'OpenAI returned an empty response');
    }

    try {
      const parsed = JSON.parse(content);
      return schema.parse(parsed);
    } catch (error) {
      throw new ApiError(502, 'PROVIDER_PARSE_ERROR', 'Unable to parse OpenAI response', {
        original: content,
        error: error instanceof Error ? error.message : 'unknown error'
      });
    }
  }

  private buildContext(language: SupportedLanguage, text: string) {
    return `Language: ${language}
Text:
"""
${text}
"""`;
  }

  async analyzeSentiment(input: AnalysisRequest & { language: SupportedLanguage }): Promise<SentimentResult> {
    const schema = z.object({
      label: z.enum(['positive', 'neutral', 'negative']),
      score: z.number().min(0).max(1),
      tones: z
        .array(
          z.object({
            label: z.string(),
            score: z.number().min(0).max(1)
          })
        )
        .optional()
    });

    const systemPrompt =
      'You are a Nordic language sentiment analyst. Return strict JSON describing sentiment and tone nuances.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nDetermine overall sentiment and optional tone nuances.`;

    return this.runStructuredTask(systemPrompt, userPrompt, schema);
  }

  async classifyTopics(input: AnalysisRequest & { language: SupportedLanguage }): Promise<TopicClassificationResult> {
    const schema = z.object({
      topics: z.array(
        z.object({
          label: z.string(),
          score: z.number().min(0).max(1)
        })
      )
    });

    const systemPrompt =
      'You are a Nordic CX analyst. Return relevant customer topics with confidence scores in JSON format.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nIdentify topics such as delivery, price, support, features, usability, complaints, praise and more.`;
    return this.runStructuredTask(systemPrompt, userPrompt, schema);
  }

  async extractKeywords(input: AnalysisRequest & { language: SupportedLanguage }): Promise<KeywordExtractionResult> {
    const schema = z.object({
      keywords: z.array(
        z.object({
          text: z.string(),
          type: z.enum(['word', 'phrase']).or(z.string()),
          importance: z.number().min(0).max(1),
          frequency: z.number().int().min(1)
        })
      )
    });

    const systemPrompt =
      'You are a Nordic SEO assistant. Extract important keywords/phrases as JSON with importance and frequency.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nReturn between 5 and 12 keywords/phrases focusing on relevance.`;
    const { keywords } = await this.runStructuredTask(systemPrompt, userPrompt, schema);
    return keywords.map((keyword) => ({
      ...keyword,
      type: keyword.type === 'phrase' || keyword.type === 'word' ? keyword.type : 'word'
    }));
  }

  async summarize(
    input: AnalysisRequest & { language: SupportedLanguage; summaryLength: 'short' | 'long' }
  ): Promise<SummaryResult> {
    const schema = z.object({
      summary: z.string()
    });

    const systemPrompt =
      'You are a professional Nordic summarizer. Produce fluent summaries, never switching language if not needed.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nProduce a ${input.summaryLength} summary.`;
    const { summary } = await this.runStructuredTask(systemPrompt, userPrompt, schema);
    return {
      summary,
      language: input.language,
      originalLength: input.text.length,
      summaryLength: input.summaryLength
    };
  }

  async detectToxicity(input: AnalysisRequest & { language: SupportedLanguage }): Promise<ToxicityResult> {
    const schema = z.object({
      isToxic: z.boolean(),
      labels: z.array(z.string()),
      scores: z.record(z.number().min(0).max(1))
    });

    const systemPrompt =
      'You are a Nordic content safety service. Detect insults, hate speech, harassment, threats, discrimination, profanity.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nReturn whether the text is toxic. Provide per-label scores.`;

    return this.runStructuredTask(systemPrompt, userPrompt, schema);
  }

  async extractEntities(input: AnalysisRequest & { language: SupportedLanguage }): Promise<NamedEntityResult> {
    const schema = z.object({
      entities: z.array(
        z.object({
          text: z.string(),
          type: z.string(),
          start: z.number().int().nonnegative(),
          end: z.number().int().nonnegative()
        })
      )
    });

    const systemPrompt =
      'You are a Nordic NER model. Extract persons, locations, organizations, dates, monetary values, and products.';
    const userPrompt = `${this.buildContext(
      input.language,
      input.text
    )}\nProvide the character offsets using UTF-16 code units.`;
    const { entities } = await this.runStructuredTask(systemPrompt, userPrompt, schema);
    return entities;
  }
}
