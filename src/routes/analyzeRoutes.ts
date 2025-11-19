import { Router } from 'express';
import { analyzeController } from '../controllers/analyzeController';
import { validateBody } from '../middleware/validateRequest';
import { analysisRequestSchema } from '../types/schemas';
import { createFeatureGate } from '../middleware/featureGate';

const router = Router();

router.post('/full', createFeatureGate('full'), validateBody(analysisRequestSchema), analyzeController.full);
router.post('/sentiment', createFeatureGate('sentiment'), validateBody(analysisRequestSchema), analyzeController.sentiment);
router.post('/topics', createFeatureGate('topics'), validateBody(analysisRequestSchema), analyzeController.topics);
router.post('/keywords', createFeatureGate('keywords'), validateBody(analysisRequestSchema), analyzeController.keywords);
router.post('/summary', createFeatureGate('summary'), validateBody(analysisRequestSchema), analyzeController.summary);
router.post('/toxicity', createFeatureGate('toxicity'), validateBody(analysisRequestSchema), analyzeController.toxicity);
router.post('/entities', createFeatureGate('entities'), validateBody(analysisRequestSchema), analyzeController.entities);

export const analyzeRoutes = router;
