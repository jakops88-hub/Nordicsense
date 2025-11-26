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

  private getLanguageContext(lang: SupportedLanguage): string {
    const baseRules = `Pay close attention to words with multiple meanings and sarcasm.
Common Nordic examples:
- Swedish: 'Vilken fart!' = positive (speed), NOT flatulence.
- Swedish: 'Slut på lager' = neutral (out of stock), NOT an insult ('slut').
- Swedish: 'Gift' can mean married (neutral/positive) or poison (negative). Context is key.
- Danish/Norwegian: 'Fart' means 'speed' and is not flatulence.
`;

    switch (lang) {
      case 'sv':
        return `${baseRules}
Swedish-specific nuances:
- Sarcasm is common. Quotes around positive words like "Det var ju 'jättebra'..." often indicate sarcasm and negative sentiment.
- The word 'not' at the end of a positive sentence indicates sarcasm, e.g., 'Vilken bra idé... not.'
`;
      case 'da':
        return `${baseRules}
Danish-specific nuances:
- Be aware of false friends. For example, 'rar' means 'pleasant' or 'nice' (positive), not 'weird'. 'Han är en rar gutt' is a positive statement.
- 'Frokost' means lunch, not breakfast.
`;
      case 'no':
        return `${baseRules}
Norwegian-specific nuances:
- Pay attention to dialect and context. For example, 'tøs' can be derogatory or playful depending on the situation.
- Differentiate between Bokmål and Nynorsk if possible, though context is more important.
`;
      case 'fi':
        return `${baseRules}
Finnish-specific nuances:
- Finnish is an agglutinative language. Words can be very long and compound. Analyze the morphology.
- 'No niin' is highly contextual and can mean anything from 'well now' (neutral) to 'oh great' (sarcastic) or 'that's it!' (positive).
- 'Joo joo' often implies disbelief or impatience, not just simple agreement.
`;
      default:
        return baseRules;
    }
  }

  private buildContext(language: SupportedLanguage, text: string, taskPrompt: string) {
    const languageContext = this.getLanguageContext(language);
    return `Perform the following task on the text provided.
LANGUAGE-SPECIFIC CONTEXT:
${languageContext}

TASK:
${taskPrompt}

TEXT:
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

    const systemPrompt = `You are a master Nordic language sentiment analyst. Your response must be a single, minified JSON object that strictly adheres to the requested schema. Do not add any extra text, explanations, or markdown.`;
    const taskPrompt = `Determine the overall sentiment (positive, neutral, negative) and score. Also identify any emotional, social, or writing style tones present.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);

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

    const systemPrompt = `You are a master Nordic CX analyst. Your response must be a single, minified JSON object that strictly adheres to the requested schema. Do not add any extra text, explanations, or markdown.`;
    const taskPrompt = `Identify relevant customer topics such as delivery, price, support, product quality, features, usability, complaints, praise, and bug reports. Provide a confidence score for each.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);
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
      'You are a Nordic SEO assistant. Extract important keywords/phrases as JSON with importance and frequency. Your response must be a single, minified JSON object that strictly adheres to the requested schema.';
    const taskPrompt = `Return between 5 and 12 keywords or phrases, focusing on relevance for search engine optimization.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);

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
      'You are a professional Nordic summarizer. Produce fluent summaries, never switching language if not needed. Your response must be a single, minified JSON object that strictly adheres to the requested schema.';
    const taskPrompt = `Produce a ${input.summaryLength} summary of the text.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);

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

    const systemPrompt = `You are a Nordic content safety service. Your response must be a single, minified JSON object that strictly adheres to the requested schema. Do not add any extra text, explanations, or markdown.`;
    const taskPrompt = `Detect insults, hate speech, harassment, threats, discrimination, and profanity. Return whether the text is toxic and provide per-label scores for any detected categories.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);

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
      'You are a Nordic NER model. Extract persons, locations, organizations, dates, monetary values, and products. Your response must be a single, minified JSON object that strictly adheres to the requested schema.';
    const taskPrompt = `Provide the character offsets using UTF-16 code units.`;
    const userPrompt = this.buildContext(input.language, input.text, taskPrompt);
    const { entities } = await this.runStructuredTask(systemPrompt, userPrompt, schema);
    return entities;
  }
}
