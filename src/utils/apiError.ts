export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  new ApiError(400, 'BAD_REQUEST', message, details);

export const tooManyRequests = (message: string) => new ApiError(429, 'RATE_LIMITED', message);

export const internalError = (message = 'Internal server error') =>
  new ApiError(500, 'INTERNAL_ERROR', message);
