import type { Request, Response, NextFunction } from 'express';
import { textAnalysisService } from '../services';
import type { AnalysisRequest } from '../types/analysis';

type TypedRequest = Request<unknown, unknown, AnalysisRequest>;

export const analyzeController = {
  full: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.analyzeFull(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  sentiment: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.analyzeSentiment(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  topics: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.classifyTopics(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  keywords: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.extractKeywords(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  summary: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.summarize(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  toxicity: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.detectToxicity(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  entities: async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await textAnalysisService.extractEntities(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
