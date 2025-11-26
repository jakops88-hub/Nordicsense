export type SupportedLanguage = 'sv' | 'no' | 'da' | 'fi' | 'en';

export interface AnalysisRequest {
  text: string;
  language?: SupportedLanguage;
  summaryLength?: 'short' | 'long';
  anonymize?: boolean;
}

export interface AnalysisBatchRequest {
  items: AnalysisRequest[];
}

// ... (rest of the interfaces are the same)

export interface SentimentTone {
  label:
    | 'angry'
    | 'frustrated'
    | 'happy'
    | 'sad'
    | 'formal'
    | 'informal'
    | 'sarcastic'
    | string;
  score: number;
}

export interface SentimentResult {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
  tones?: SentimentTone[] | undefined;
}

export interface TopicScore {
  label:
    | 'delivery'
    | 'price'
    | 'support'
    | 'product_quality'
    | 'features'
    | 'usability'
    | 'complaint'
    | 'praise'
    | 'bug_report'
    | string;
  score: number;
}

export interface TopicClassificationResult {
  topics: TopicScore[];
}

export interface KeywordResult {
  text: string;
  type: 'word' | 'phrase';
  importance: number;
  frequency: number;
}

export type KeywordExtractionResult = KeywordResult[];

export interface SummaryResult {
  summary: string;
  language: SupportedLanguage;
  originalLength: number;
  summaryLength: 'short' | 'long';
}

export interface ToxicityResult {
  isToxic: boolean;
  labels: string[];
  scores: Record<string, number>;
}

export interface NamedEntity {
  text: string;
  type: 'person' | 'location' | 'organization' | 'date' | 'money' | 'product' | string;
  start: number;
  end: number;
}

export type NamedEntityResult = NamedEntity[];

export interface FullAnalysisResult {
  language: SupportedLanguage;
  sentiment: SentimentResult;
  topics: TopicClassificationResult;
  keywords: KeywordExtractionResult;
  summary: SummaryResult;
  toxicity: ToxicityResult;
  entities: NamedEntityResult;
  meta: {
    provider: string;
    processingTimeMs: number;
    cached?: boolean;
  };
}

export interface ApiError {
  error: true;
  message: string;
  originalText: string;
}

export type BatchAnalysisResult = FullAnalysisResult | ApiError;

export interface AnalysisContext extends AnalysisRequest {
  detectedLanguage?: SupportedLanguage;
}

export type AnalysisFeature = 'full' | 'batch' | 'sentiment' | 'topics' | 'keywords' | 'summary' | 'toxicity' | 'entities';
