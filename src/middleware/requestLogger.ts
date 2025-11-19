import pinoHttp from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';
import { logger } from '../config/logger';

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req: IncomingMessage) => req.url === '/health'
  },
  customProps: (req) => ({
    path: req.url,
    method: req.method
  }),
  customAttributeKeys: {
    reqId: 'requestId'
  },
  redact: ['req.headers.authorization'],
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (_req: IncomingMessage, res: ServerResponse) =>
    `Handled request with status ${res.statusCode}`
});
