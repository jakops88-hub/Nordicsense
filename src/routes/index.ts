import { Router } from 'express';
import { analyzeRoutes } from './analyzeRoutes';
import { apiKeyAuth } from '../middleware/apiKeyAuth';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use(apiKeyAuth);
router.use('/analyze', analyzeRoutes);

export const apiRouter = router;
