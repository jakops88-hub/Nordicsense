import { createApp } from './app';
import { appConfig } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(appConfig.port, () => {
  logger.info({ port: appConfig.port }, 'NordicSense API listening');
});
