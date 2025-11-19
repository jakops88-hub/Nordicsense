import { Router } from 'express';
import { analyzeRoutes } from './analyzeRoutes';

const router = Router();

router.use('/analyze', analyzeRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const apiRouter = router;
