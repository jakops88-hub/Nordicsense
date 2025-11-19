import { Router } from 'express';
import { analyzeController } from '../controllers/analyzeController';
import { validateBody } from '../middleware/validateRequest';
import { analysisRequestSchema } from '../types/schemas';

const router = Router();

router.post('/full', validateBody(analysisRequestSchema), analyzeController.full);
router.post('/sentiment', validateBody(analysisRequestSchema), analyzeController.sentiment);
router.post('/topics', validateBody(analysisRequestSchema), analyzeController.topics);
router.post('/keywords', validateBody(analysisRequestSchema), analyzeController.keywords);
router.post('/summary', validateBody(analysisRequestSchema), analyzeController.summary);
router.post('/toxicity', validateBody(analysisRequestSchema), analyzeController.toxicity);
router.post('/entities', validateBody(analysisRequestSchema), analyzeController.entities);

export const analyzeRoutes = router;
