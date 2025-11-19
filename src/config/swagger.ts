import swaggerJsdoc from 'swagger-jsdoc';
import { appConfig } from './env';

const analysisRequestSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: {
      type: 'string',
      description: 'Input text to analyze',
      example: 'Leveransen var sen och kundtjänst svarade aldrig.'
    },
    language: {
      type: 'string',
      enum: ['sv', 'no', 'da', 'fi', 'en'],
      description: 'Optional language hint'
    },
    summaryLength: {
      type: 'string',
      enum: ['short', 'long'],
      description: 'Summary granularity (used by /summary or /full endpoints)'
    }
  }
};

const sentimentSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
    score: { type: 'number', minimum: 0, maximum: 1 },
    tones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          score: { type: 'number', minimum: 0, maximum: 1 }
        }
      }
    }
  }
};

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'NordicSense API',
    version: '1.0.0',
    description:
      'Production-ready Nordic language text analysis API covering sentiment, topics, keywords, summaries, toxicity, and NER.'
  },
  servers: [
    {
      url: `http://localhost:${appConfig.port}`,
      description: 'Local development'
    }
  ],
  tags: [
    {
      name: 'Analysis',
      description: 'Text analysis endpoints'
    }
  ],
  components: {
    schemas: {
      AnalysisRequest: analysisRequestSchema,
      SentimentResponse: sentimentSchema,
      TopicResponse: {
        type: 'object',
        properties: {
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                score: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          }
        }
      },
      KeywordResponse: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            type: { type: 'string', enum: ['word', 'phrase'] },
            importance: { type: 'number', minimum: 0, maximum: 1 },
            frequency: { type: 'integer', minimum: 1 }
          }
        }
      },
      SummaryResponse: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          language: { type: 'string' },
          originalLength: { type: 'integer' },
          summaryLength: { type: 'string', enum: ['short', 'long'] }
        }
      },
      ToxicityResponse: {
        type: 'object',
        properties: {
          isToxic: { type: 'boolean' },
          labels: {
            type: 'array',
            items: { type: 'string' }
          },
          scores: {
            type: 'object',
            additionalProperties: {
              type: 'number',
              minimum: 0,
              maximum: 1
            }
          }
        }
      },
      EntityResponse: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            type: { type: 'string' },
            start: { type: 'integer' },
            end: { type: 'integer' }
          }
        }
      },
      FullAnalysisResponse: {
        type: 'object',
        properties: {
          language: { type: 'string' },
          sentiment: { $ref: '#/components/schemas/SentimentResponse' },
          topics: { $ref: '#/components/schemas/TopicResponse' },
          keywords: { $ref: '#/components/schemas/KeywordResponse' },
          summary: { $ref: '#/components/schemas/SummaryResponse' },
          toxicity: { $ref: '#/components/schemas/ToxicityResponse' },
          entities: { $ref: '#/components/schemas/EntityResponse' },
          meta: {
            type: 'object',
            properties: {
              provider: { type: 'string' },
              processingTimeMs: { type: 'integer' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object', additionalProperties: true }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/analyze/full': {
      post: {
        tags: ['Analysis'],
        summary: 'Run the full NordicSense analysis suite',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: analysisRequestSchema
            }
          }
        },
        responses: {
          200: {
            description: 'Full analysis result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FullAnalysisResponse' }
              }
            }
          },
          400: {
            description: 'Validation problem',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/analyze/sentiment': {
      post: {
        tags: ['Analysis'],
        summary: 'Sentiment analysis',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: analysisRequestSchema
            }
          }
        },
        responses: {
          200: {
            description: 'Sentiment result',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SentimentResponse' } } }
          }
        }
      }
    },
    '/api/analyze/topics': {
      post: {
        tags: ['Analysis'],
        summary: 'Topic classification',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: analysisRequestSchema } }
        },
        responses: {
          200: {
            description: 'Topics detected',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TopicResponse' } } }
          }
        }
      }
    },
    '/api/analyze/keywords': {
      post: {
        tags: ['Analysis'],
        summary: 'Keyword extraction',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: analysisRequestSchema } }
        },
        responses: {
          200: {
            description: 'Keywords extracted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/KeywordResponse' } } }
          }
        }
      }
    },
    '/api/analyze/summary': {
      post: {
        tags: ['Analysis'],
        summary: 'Summarize text',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: analysisRequestSchema } }
        },
        responses: {
          200: {
            description: 'Summary produced',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SummaryResponse' } } }
          }
        }
      }
    },
    '/api/analyze/toxicity': {
      post: {
        tags: ['Analysis'],
        summary: 'Detect toxicity',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: analysisRequestSchema } }
        },
        responses: {
          200: {
            description: 'Toxicity report',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ToxicityResponse' } } }
          }
        }
      }
    },
    '/api/analyze/entities': {
      post: {
        tags: ['Analysis'],
        summary: 'Named entity recognition',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: analysisRequestSchema } }
        },
        responses: {
          200: {
            description: 'Entities detected',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EntityResponse' } } }
          }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});
