import type { Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from '../../src/middleware/apiKeyAuth';
import { appConfig } from '../../src/config/env';
import { ApiError } from '../../src/utils/apiError';

describe('apiKeyAuth middleware', () => {
  const res = {} as Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next = jest.fn();
    appConfig.apiKeys = ['secret-key'];
  });

  afterEach(() => {
    appConfig.apiKeys = [];
  });

  const createRequest = (headers: Record<string, string | undefined>): Request =>
    ({
      header: (name: string) => headers[name.toLowerCase()]
    } as unknown as Request);

  it('rejects missing API key', () => {
    const req = createRequest({});
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = next.mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(401);
  });

  it('accepts valid x-api-key header', () => {
    const req = createRequest({ 'x-api-key': 'secret-key' });
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('accepts Bearer token in Authorization header', () => {
    const req = createRequest({ authorization: 'Bearer secret-key' });
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
