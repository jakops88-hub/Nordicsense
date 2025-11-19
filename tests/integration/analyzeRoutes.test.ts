import request from 'supertest';
import type { FullAnalysisResult, SentimentResult } from '../../src/types/analysis';

const sentimentStub: SentimentResult = { label: 'positive', score: 0.94 };

jest.mock('../../src/services', () => {
  const summary = {
    summary: 'Detta är en kort summering.',
    language: 'sv',
    originalLength: 42,
    summaryLength: 'short'
  } as const;

  const fullAnalysis: FullAnalysisResult = {
    language: 'sv',
    sentiment: sentimentStub,
    topics: { topics: [{ label: 'delivery', score: 0.8 }] },
    keywords: [{ text: 'leverans', type: 'word', importance: 0.8, frequency: 1 }],
    summary,
    toxicity: { isToxic: false, labels: [], scores: {} },
    entities: [],
    meta: { provider: 'mock', processingTimeMs: 1 }
  };

  return {
    textAnalysisService: {
      analyzeFull: jest.fn().mockResolvedValue(fullAnalysis),
      analyzeSentiment: jest.fn().mockResolvedValue(sentimentStub),
      classifyTopics: jest.fn(),
      extractKeywords: jest.fn(),
      summarize: jest.fn().mockResolvedValue(summary),
      detectToxicity: jest.fn(),
      extractEntities: jest.fn()
    }
  };
});

import { createApp } from '../../src/app';

const app = createApp();

describe('Analyze routes', () => {
  it('returns sentiment analysis', async () => {
    const response = await request(app).post('/api/analyze/sentiment').send({ text: 'Jag är glad.' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(sentimentStub);
  });

  it('returns full analysis payload', async () => {
    const response = await request(app).post('/api/analyze/full').send({ text: 'Ordern var sen.' });
    expect(response.status).toBe(200);
    expect(response.body.language).toBe('sv');
    expect(response.body.sentiment).toEqual(sentimentStub);
    expect(response.body.meta.provider).toBe('mock');
  });
});
