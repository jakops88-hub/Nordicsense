import {
  AnalysisRequest,
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

export class TextAnalysisService {
  constructor(private readonly provider: NlpProvider) {}

  private resolveLanguage(request: AnalysisRequest): SupportedLanguage {
    return request.language ?? detectLanguage(request.text);
  }

  async analyzeSentiment(request: AnalysisRequest): Promise<SentimentResult> {
    const language = this.resolveLanguage(request);
    return this.provider.analyzeSentiment({ ...request, language });
  }

  async classifyTopics(request: AnalysisRequest): Promise<TopicClassificationResult> {
    const language = this.resolveLanguage(request);
    return this.provider.classifyTopics({ ...request, language });
  }

  async extractKeywords(request: AnalysisRequest): Promise<KeywordExtractionResult> {
    const language = this.resolveLanguage(request);
    return this.provider.extractKeywords({ ...request, language });
  }

  async summarize(request: AnalysisRequest): Promise<SummaryResult> {
    const language = this.resolveLanguage(request);
    const summaryLength = request.summaryLength ?? appConfig.defaultSummaryLength;
    return this.provider.summarize({ ...request, language, summaryLength });
  }

  async detectToxicity(request: AnalysisRequest): Promise<ToxicityResult> {
    const language = this.resolveLanguage(request);
    return this.provider.detectToxicity({ ...request, language });
  }

  async extractEntities(request: AnalysisRequest): Promise<NamedEntityResult> {
    const language = this.resolveLanguage(request);
    return this.provider.extractEntities({ ...request, language });
  }

  async analyzeFull(request: AnalysisRequest): Promise<FullAnalysisResult> {
    const language = this.resolveLanguage(request);
    const summaryLength = request.summaryLength ?? appConfig.defaultSummaryLength;
    const started = Date.now();

    const [sentiment, topics, keywords, summary, toxicity, entities] = await Promise.all([
      this.provider.analyzeSentiment({ ...request, language }),
      this.provider.classifyTopics({ ...request, language }),
      this.provider.extractKeywords({ ...request, language }),
      this.provider.summarize({ ...request, language, summaryLength }),
      this.provider.detectToxicity({ ...request, language }),
      this.provider.extractEntities({ ...request, language })
    ]);

    return {
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
  }
}
