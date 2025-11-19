import pino, { type LoggerOptions } from 'pino';
import { appConfig } from './env';

const devTransport: LoggerOptions['transport'] = appConfig.isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    };

export const logger = pino({
  level: appConfig.logLevel,
  ...(devTransport ? { transport: devTransport } : {})
});
