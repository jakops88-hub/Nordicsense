# NordicSense API

NordicSense is a production-ready Node.js + TypeScript API that delivers advanced text analytics for Swedish and other Nordic languages. It consolidates sentiment analysis, topic classification, keyword extraction, summaries, toxicity detection, and named-entity recognition behind a single REST interface suitable for RapidAPI or SaaS deployments.

## Features
- Language-aware sentiment analysis with tone hints.
- Multi-label topic classification for CX/product feedback.
- Keyword and keyphrase extraction with importance + frequency.
- Short/long abstractive summaries.
- Nordic-focused toxicity detection.
- Named entity recognition for people, places, organizations, products, monetary values, and dates.
- Built-in language detection fallback (Swedish default).
- Hardened Express stack (Helmet, CORS, rate limiting, structured logging).
- Swagger/OpenAPI docs at `/api/docs`.

## Getting Started

### Prerequisites
- Node.js 18.18+
- An OpenAI API key with access to `gpt-4o-mini` (or compatible) models.

### Installation
```bash
npm install
cp .env.example .env
# edit .env with your credentials
```

### Scripts
```bash
npm run dev     # start development server with ts-node-dev
npm run build   # compile TypeScript to dist/
npm start       # run compiled server
npm test        # execute Jest unit + integration tests
```

## Configuration
Environment variables live in `.env` (see `.env.example`):

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime environment. |
| `PORT` | `4000` | HTTP port. |
| `OPENAI_API_KEY` | – | Required for OpenAI provider. |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in ms. |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | Allowed requests per IP per window. |
| `CORS_ORIGIN` | `*` | Allowed origin(s) for CORS. |
| `LOG_LEVEL` | `info` | Pino log level. |
| `DEFAULT_SUMMARY_LENGTH` | `short` | Default summary size. |
| `MAX_TEXT_LENGTH` | `20000` | Maximum text payload length. |
| `ALLOWED_ANALYSIS_FEATURES` | `full,sentiment,topics,keywords,summary,toxicity,entities` | Comma-separated list of enabled endpoints. |
| `API_KEYS` | – | Comma-separated list of API keys (required for RapidAPI consumers). |

## API Overview
All endpoints live under `/api`. Send JSON payloads:
```json
{
  "text": "Leveransen var sen och kundtjänst svarade aldrig.",
  "language": "sv",
  "summaryLength": "short"
}
```

### Endpoints
1. `POST /api/analyze/full` – runs the entire analysis suite.
2. `POST /api/analyze/sentiment` – sentiment + tones.
3. `POST /api/analyze/topics` – topic classification.
4. `POST /api/analyze/keywords` – keyword/keyphrase extraction.
5. `POST /api/analyze/summary` – short/long summary.
6. `POST /api/analyze/toxicity` – toxicity & safety flags.
7. `POST /api/analyze/entities` – NER results.

### Example Requests
```bash
curl -X POST http://localhost:4000/api/analyze/sentiment \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"text":"Jag älskar den nya designen!", "language":"sv"}'

curl -X POST http://localhost:4000/api/analyze/topics \
  -H "Content-Type: application/json" \
  -d '{"text":"Supporten tog tre dagar att svara.", "language":"sv"}'

curl -X POST http://localhost:4000/api/analyze/keywords \
  -H "Content-Type: application/json" \
  -d '{"text":"Leveransen var sen men priset var bra."}'

curl -X POST http://localhost:4000/api/analyze/summary \
  -H "Content-Type: application/json" \
  -d '{"text":"Kunden beskriver...", "summaryLength":"long"}'

curl -X POST http://localhost:4000/api/analyze/toxicity \
  -H "Content-Type: application/json" \
  -d '{"text":"Denna support är värdelös."}'

curl -X POST http://localhost:4000/api/analyze/entities \
  -H "Content-Type: application/json" \
  -d '{"text":"Volvo lanserade en ny bil i Göteborg den 5 maj."}'

curl -X POST http://localhost:4000/api/analyze/full \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"text":"Leveransen var sen men supporten löste det snabbt."}'
```

## Documentation
OpenAPI/Swagger documentation is served at `GET /api/docs`.

## Testing
Unit and integration coverage relies on Jest + Supertest. External provider calls are mocked, keeping the suite fast and deterministic.

```bash
npm test
```

## Deployment Notes
- Designed to run on Render, Railway, Vercel (functions), or any Dockerized Node 18+ environment.
- Ensure `NODE_ENV=production`, configure `OPENAI_API_KEY`, and adjust rate limits + CORS per tenant.
