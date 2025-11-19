"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textAnalysisService_1 = require("../../src/services/textAnalysisService");
jest.mock('../../src/services/languageService', () => ({
    detectLanguage: jest.fn().mockReturnValue('sv')
}));
const mockSentiment = { label: 'negative', score: 0.8 };
const mockTopics = { topics: [{ label: 'delivery', score: 0.92 }] };
const mockKeywords = [
    { text: 'sen leverans', type: 'phrase', importance: 0.9, frequency: 1 }
];
const mockSummary = {
    summary: 'Sammanfattning',
    language: 'sv',
    originalLength: 50,
    summaryLength: 'short'
};
const mockToxicity = { isToxic: false, labels: [], scores: {} };
const mockEntities = [{ text: 'Nordic', type: 'organization', start: 0, end: 6 }];
const createProviderStub = () => ({
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
        const service = new textAnalysisService_1.TextAnalysisService(provider);
        const result = await service.analyzeFull({ text: 'Leveransen var sen' });
        expect(provider.analyzeSentiment).toHaveBeenCalled();
        expect(provider.classifyTopics).toHaveBeenCalled();
        expect(provider.extractKeywords).toHaveBeenCalled();
        expect(provider.summarize).toHaveBeenCalledWith(expect.objectContaining({ summaryLength: 'short' }));
        expect(result.language).toBe('sv');
        expect(result.meta.provider).toBe('mock');
        expect(result.sentiment).toEqual(mockSentiment);
    });
    it('passes explicit summary length to provider', async () => {
        const provider = createProviderStub();
        const service = new textAnalysisService_1.TextAnalysisService(provider);
        await service.summarize({ text: 'Hej världen', summaryLength: 'long', language: 'sv' });
        expect(provider.summarize).toHaveBeenCalledWith(expect.objectContaining({ summaryLength: 'long' }));
    });
});
//# sourceMappingURL=textAnalysisService.test.js.map