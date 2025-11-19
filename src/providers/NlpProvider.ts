import {
  AnalysisRequest,
  NamedEntityResult,
  KeywordExtractionResult,
  SentimentResult,
  SummaryResult,
  SupportedLanguage,
  TopicClassificationResult,
  ToxicityResult
} from '../types/analysis';

export interface NlpProvider {
  readonly name: string;
  analyzeSentiment(input: AnalysisRequest & { language: SupportedLanguage }): Promise<SentimentResult>;
  classifyTopics(input: AnalysisRequest & { language: SupportedLanguage }): Promise<TopicClassificationResult>;
  extractKeywords(input: AnalysisRequest & { language: SupportedLanguage }): Promise<KeywordExtractionResult>;
  summarize(
    input: AnalysisRequest & { language: SupportedLanguage; summaryLength: 'short' | 'long' }
  ): Promise<SummaryResult>;
  detectToxicity(input: AnalysisRequest & { language: SupportedLanguage }): Promise<ToxicityResult>;
  extractEntities(input: AnalysisRequest & { language: SupportedLanguage }): Promise<NamedEntityResult>;
}
