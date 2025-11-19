import { TextAnalysisService } from '../../src/services/textAnalysisService';
import type { NlpProvider } from '../../src/providers/NlpProvider';
import type {
  KeywordExtractionResult,
  NamedEntityResult,
  SentimentResult,
  SummaryResult,
  TopicClassificationResult,
  ToxicityResult
} from '../../src/types/analysis';

jest.mock('../../src/services/languageService', () => ({
  detectLanguage: jest.fn().mockResolvedValue('sv')
}));

const mockSentiment: SentimentResult = { label: 'negative', score: 0.8 };
const mockTopics: TopicClassificationResult = { topics: [{ label: 'delivery', score: 0.92 }] };
const mockKeywords: KeywordExtractionResult = [
  { text: 'sen leverans', type: 'phrase', importance: 0.9, frequency: 1 }
];
const mockSummary: SummaryResult = {
  summary: 'Sammanfattning',
  language: 'sv',
  originalLength: 50,
  summaryLength: 'short'
};
const mockToxicity: ToxicityResult = { isToxic: false, labels: [], scores: {} };
const mockEntities: NamedEntityResult = [{ text: 'Nordic', type: 'organization', start: 0, end: 6 }];

const createProviderStub = (): jest.Mocked<NlpProvider> => ({
  name: 'mock',
  analyzeSentiment: jest.fn().mockResolvedValue(mockSentiment),
  classifyTopics: jest.fn().mockResolvedValue(mockTopics),
  extractKeywords: jest.fn().mockResolvedValue(mockKeywords),
  summarize: jest.fn().mockResolvedValue(mockSummary),
  detectToxicity: jest.fn().mockResolvedValue(mockToxicity),
  extractEntities: jest.fn().mockResolvedValue(mockEntities)
});

describe('TextAnalysisService', () => {
  it('delegates full analysis to provider and aggregates results', async () => {
    const provider = createProviderStub();
    const service = new TextAnalysisService(provider);

    const result = await service.analyzeFull({ text: 'Leveransen var sen' });

    expect(provider.analyzeSentiment).toHaveBeenCalled();
    expect(provider.classifyTopics).toHaveBeenCalled();
    expect(provider.extractKeywords).toHaveBeenCalled();
    expect(provider.summarize).toHaveBeenCalledWith(
      expect.objectContaining({ summaryLength: 'short' })
    );
    expect(result.language).toBe('sv');
    expect(result.meta.provider).toBe('mock');
    expect(result.sentiment).toEqual(mockSentiment);
  });

  it('passes explicit summary length to provider', async () => {
    const provider = createProviderStub();
    const service = new TextAnalysisService(provider);

    await service.summarize({ text: 'Hej världen', summaryLength: 'long', language: 'sv' });

    expect(provider.summarize).toHaveBeenCalledWith(
      expect.objectContaining({ summaryLength: 'long' })
    );
  });
});
