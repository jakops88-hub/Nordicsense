import {
  AnalysisBatchRequest,
  AnalysisRequest,
  BatchAnalysisResult,
  FullAnalysisResult,
  KeywordExtractionResult,
  NamedEntityResult,
  SentimentResult,
  SummaryResult,
  SupportedLanguage,
  TopicClassificationResult,
  ToxicityResult
} from '../types/analysis';
import { detectLanguage } from './languageService';
import { NlpProvider } from '../providers/NlpProvider';
import { appConfig } from '../config/env';
import CacheService from './cacheService';
import { PiiService } from './piiService';

export class TextAnalysisService {
  constructor(
    private readonly provider: NlpProvider,
    private readonly cache: CacheService<FullAnalysisResult>,
    private readonly piiService: PiiService
  ) {}

  private _maybeAnonymize(request: AnalysisRequest): AnalysisRequest {
    if (request.anonymize) {
      const anonymizedText = this.piiService.anonymize(request.text);
      return { ...request, text: anonymizedText };
    }
    return request;
  }

  private async resolveLanguage(request: AnalysisRequest): Promise<SupportedLanguage> {
    if (request.language) {
      return request.language;
    }
    return detectLanguage(request.text);
  }

  async analyzeSentiment(request: AnalysisRequest): Promise<SentimentResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    return this.provider.analyzeSentiment({ ...req, language });
  }

  async classifyTopics(request: AnalysisRequest): Promise<TopicClassificationResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    return this.provider.classifyTopics({ ...req, language });
  }

  async extractKeywords(request: AnalysisRequest): Promise<KeywordExtractionResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    return this.provider.extractKeywords({ ...req, language });
  }

  async summarize(request: AnalysisRequest): Promise<SummaryResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    const summaryLength = req.summaryLength ?? appConfig.defaultSummaryLength;
    return this.provider.summarize({ ...req, language, summaryLength });
  }

  async detectToxicity(request: AnalysisRequest): Promise<ToxicityResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    return this.provider.detectToxicity({ ...req, language });
  }

  async extractEntities(request: AnalysisRequest): Promise<NamedEntityResult> {
    const req = this._maybeAnonymize(request);
    const language = await this.resolveLanguage(req);
    return this.provider.extractEntities({ ...req, language });
  }

  async analyzeFull(request: AnalysisRequest): Promise<FullAnalysisResult> {
    const req = this._maybeAnonymize(request);
    if (req.text.length < 20) {
      return {
        language: 'en', // Or detect language if needed
        sentiment: { label: 'neutral', score: 0.5 },
        topics: { topics: [] },
        keywords: [],
        summary: { summary: req.text, language: 'en', originalLength: req.text.length, summaryLength: 'short' },
        toxicity: { isToxic: false, labels: [], scores: {} },
        entities: [],
        meta: {
          provider: 'short_text_shortcut',
          processingTimeMs: 1
        }
      };
    }
    
    const language = await this.resolveLanguage(req);
    const summaryLength = req.summaryLength ?? appConfig.defaultSummaryLength;
    const requestWithLang = { ...req, language, summaryLength };

    const cachedResult = this.cache.get(requestWithLang);
    if (cachedResult) {
      return { ...cachedResult, meta: { ...cachedResult.meta, cached: true } };
    }

    const started = Date.now();

    const [sentiment, topics, keywords, summary, toxicity, entities] = await Promise.all([
      this.provider.analyzeSentiment(requestWithLang),
      this.provider.classifyTopics(requestWithLang),
      this.provider.extractKeywords(requestWithLang),
      this.provider.summarize(requestWithLang),
      this.provider.detectToxicity(requestWithLang),
      this.provider.extractEntities(requestWithLang)
    ]);

    const result: FullAnalysisResult = {
      language,
      sentiment,
      topics,
      keywords,
      summary,
      toxicity,
      entities,
      meta: {
        provider: this.provider.name,
        processingTimeMs: Date.now() - started
      }
    };

    this.cache.set(requestWithLang, result);

    return result;
  }

  async analyzeBatch(request: AnalysisBatchRequest): Promise<BatchAnalysisResult[]> {
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(5);

    const promises = request.items.map(item =>
      limit(async () => {
        try {
          return await this.analyzeFull(item);
        } catch (error: any) {
          return {
            error: true as const,
            message: error.message || 'An unknown error occurred',
            originalText: item.text
          };
        }
      })
    );

    return Promise.all(promises);
  }
}
