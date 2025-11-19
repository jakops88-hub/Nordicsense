import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './routes';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { appConfig } from './config/env';
import { swaggerSpec } from './config/swagger';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: appConfig.corsOrigin }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get('/', (_req, res) => {
    res.json({
      name: 'NordicSense API',
      version: '1.0.0',
      docs: '/api/docs',
      uptime: process.uptime()
    });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'NordicSense API Docs' }));
  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
