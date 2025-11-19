import pino from 'pino';
import { appConfig } from './env';

export const logger = pino({
  level: appConfig.logLevel,
  transport: appConfig.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
});
