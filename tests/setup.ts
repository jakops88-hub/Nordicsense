process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-key';
process.env.API_KEYS = process.env.API_KEYS ?? '';

jest.mock('franc-min', () => ({
  franc: () => 'swe'
}));
