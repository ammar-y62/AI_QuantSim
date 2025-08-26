# AI QuantSim — Comprehensive System Design (v1)

**Stack:** React (Recharts/Tailwind) · Express/Node (TypeScript) · PostgreSQL · Redis · Firebase Auth · Python ML microservice (Prophet/LSTM) · Yahoo/Alpha Vantage data · Docker · GitHub Actions

---

## 1) Goals & Non‑Goals

**Goals**
- Accurate portfolio backtesting with clean UX and fast responses.
- Real‑time-ish quotes & historical data for charts, metrics (Sharpe, CAGR, MDD, β).
- AI assistant for explanations, Q&A, and recommendations.
- Forecasting service for single‑asset & portfolio projections.
- Multi‑tenant, secure, cost‑aware and horizontally scalable.

**Non‑Goals (v1)**
- Live brokerage execution (paper trading only later).
- Complex options/derivatives greeks.
- Full-text news indexing beyond basic filters.

---

## 2) Functional Requirements (derived from current endpoints)
- **Auth**: Login/Register, session refresh, logout; `GET /auth/me`.
- **Portfolio**: Analyze, save/retrieve/delete analyses, dashboard view.
- **Stocks**: Search, list all, OHLCV history, single/batch fetch, AI forecast.
- **AI**: Q&A tied to user/portfolio context; sentiment; document/news search; recommendations by risk profile.
- **News**: Filter by ticker/date/keywords.

---

## 3) Non‑Functional Requirements
- **Reliability**: 99.5% monthly availability; p95 API latency ≤ 600ms for cache hits; ≤ 2.5s for backtest initiation.
- **Data Freshness**: Intraday cache TTL 60–300s; historical data persisted daily.
- **Cost**: Prefer free/cheap tiers; batch & cache external API calls.
- **Security**: Firebase-backed auth; role-based scopes; OWASP top‑10 mitigations.
- **Observability**: Structured logs, traces, metrics, alerting.

---

## 4) High‑Level Architecture

```text
[ React SPA ]
   ↓ HTTPS
[ API Gateway - Express ]  ───────────────────────────────────────────────────────────┐
   |    |      |      |         |                                                    |
   |    |      |      |         |                                                    |
[Auth ] [Portfolio ][Stocks ][AI  ] [News ]                                          |
   |         |         |        |        |                                           |
   |         |         |        |        |                                           |
   |         |         |        |        |                  ┌───────────────┐        |
   |         |         |        |        |                  │  Redis Cache  │◄───────┤
   |         |         |        |        |                  └───────────────┘        |
   |         |         |        |        |                                           |
   |         |         |        |        |                                           |
   |   ┌──────────────────────────────┐  |         ┌──────────────────────────────┐  |
   └──►│ PostgreSQL (RDS/Supabase)    │◄─┼────────►│  Job Queue (BullMQ + Redis)  │──┘
       │ users / portfolios / prices  │            │ backtests / forecasts / news │
       └──────────────────────────────┘            └──────────────────────────────┘
                     ▲                                          │
                     │           REST/gRPC                      │
                     │                                          ▼
               ┌───────────────┐                          ┌───────────────┐
               │  ML Service   │                          │  Data Fetch   │
               │  (Python)     │──(Prophet/LSTM)──────────│  Integrations │
               └───────────────┘                          └───────────────┘
```

> Option: enable TimescaleDB extension for time‑series partitioning on `price_history`.

---

## 5) Authentication & Authorization (Firebase)
- SPA obtains Firebase ID token (client). Express middleware verifies tokens using Firebase Admin SDK.
- On first valid token, **provision** local user row (`users`) via `firebase_uid` (idempotent upsert).
- Issue **short‑lived** server JWT (optional) or rely on Firebase token on every request.
- Roles: `user`, `admin`. Per‑resource ownership checks (`user_id` FK) in controllers.

**Express Auth Middleware (sketch)**
```ts
async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'missing_token' });
  const decoded = await firebaseAdmin.auth().verifyIdToken(token);
  req.user = await ensureUserProvisioned(decoded);
  next();
}
```

---

## 6) API Surface → Services Mapping
- `/auth/*` → Auth controller (token verification, `/me`, logout shim)
- `/portfolio/*` → Portfolio service: backtest engine (Node worker or Python job), metrics calc, persistence.
- `/stocks/*` → Stock service: search, list, history (with provider adapters), forecast passthrough.
- `/ai/*` → AI service: Q&A, insights, recommendations, sentiment.
- `/news` → News service: provider adapter with keyword/date filters.

**Asynchrony**
- Long‑running tasks (backtests, multi‑symbol fetch, forecasts) enqueue **jobs** → workers consume (Node or Python) → update DB → client polls `/analysis/{id}` or uses WebSocket/SSE for push.

---

## 7) Data Model (PostgreSQL)

### 7.1 Entity Overview
- `users(id, firebase_uid, email, name, created_at)`
- `portfolios(id, user_id, name, created_at)`
- `portfolio_positions(id, portfolio_id, ticker, weight)`
- `portfolio_analyses(id, portfolio_id, start_date, end_date, risk_free_rate, metrics_json, perf_series_json, created_at)`
- `price_history(ticker, date, open, high, low, close, volume)` (PK `(ticker,date)`)
- `forecasts(id, ticker, model, horizon_days, generated_at, predictions_json, accuracy, confidence)`
- `ai_questions(id, user_id, portfolio_id, question, answer, sources_json, confidence, created_at)`
- `news_articles(id, ticker, published_at, title, source, url, sentiment)`
- `alerts(id, user_id, portfolio_id, rule_json, last_triggered_at)`

### 7.2 DDL (starter)
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text unique not null,
  name text,
  created_at timestamptz not null default now()
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  ticker text not null,
  weight numeric(6,3) not null check (weight >= 0),
  unique (portfolio_id, ticker)
);

create table portfolio_analyses (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  risk_free_rate numeric(6,4) default 0,
  metrics_json jsonb not null,
  perf_series_json jsonb not null,
  created_at timestamptz not null default now()
);

create table price_history (
  ticker text not null,
  dt date not null,
  open numeric(18,6), high numeric(18,6), low numeric(18,6), close numeric(18,6),
  volume bigint,
  primary key (ticker, dt)
);
create index price_history_ticker_dt_idx on price_history(ticker, dt desc);

create table forecasts (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  model text not null,
  horizon_days int not null,
  generated_at timestamptz not null default now(),
  predictions_json jsonb not null,
  accuracy numeric(5,3),
  confidence numeric(5,3)
);

create table ai_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  portfolio_id uuid references portfolios(id) on delete set null,
  question text not null,
  answer text,
  sources_json jsonb,
  confidence numeric(5,3),
  created_at timestamptz not null default now()
);
```

**Notes**
- JSONB keeps flexibility for metrics/series; move to normalized tables if query patterns demand.
- Consider **TimescaleDB** for `price_history` if datasets grow. Otherwise keep a rolling window and warm cache in Redis.

---

## 8) Caching, Rate‑Limiting & Quotas
- **Redis caches**
  - `stocks:search:{q}` → 5 min TTL
  - `stocks:history:{ticker}:{period}` → 1–24 h TTL (depends on period)
  - `price:latest:{ticker}` → 60–120 s TTL
- **Egress shields**
  - Global request budget to data providers; exponential backoff & jitter.
- **API rate limiting** (per Firebase UID + IP) via token bucket; e.g., 60 req/min (burst 120).
- **Circuit breakers** around providers; fallback to stale cache when open.

---

## 9) Core Flows (Sequence Sketches)

### 9.1 Login → Me
1. SPA gets Firebase ID token → `Authorization: Bearer <id_token>`.
2. Express verifies → upserts `users` → returns `/auth/me` payload.

### 9.2 Portfolio Analyze
1. Client POST `/portfolio/analyze` with {tickers, weights, dates, Rf}.
2. If small set, compute synchronously; else enqueue `backtest` job.
3. Worker fetches historical prices (batched, cached) → compute returns, risk metrics.
4. Persist `portfolio_analyses` + series; respond or notify via SSE/WebSocket.

### 9.3 Stock Search + History
- Debounced `/stocks/search` hits Redis first; on miss, provider adapter (Alpha Vantage/Yahoo), write‑through cache.
- `/stocks/{ticker}/history` consults DB (if present); else fetch → persist (optionally partial) → return.

### 9.4 AI Ask
- POST `/ai/ask` → build context (portfolio metrics, trends) → call LLM → store Q/A and sources.

### 9.5 Forecast
- POST `/ai/forecast` → enqueue `forecast` job → Python service (Prophet/LSTM) → persist `forecasts` row.

---

## 10) Observability
- **Logging**: pino/winston JSON logs with `request_id`, `user_id`, `route`, `latency_ms`.
- **Metrics**: Prometheus counters/gauges/histograms: `http_requests_total`, `job_duration_seconds`, `cache_hit_ratio`, `provider_errors_total`.
- **Tracing**: OpenTelemetry SDK (Express, Postgres, Redis, HTTP) → OTLP → Tempo/Jaeger.
- **Dashboards/Alerts**: Grafana; alert on p95 latency, error rate > 2%, job backlog depth.

---

## 11) Security
- Input validation (zod/joi) on every endpoint; strict CORS; CSP headers.
- Verify Firebase ID token each request; map to `user_id`.
- Row‑level authorization (user owns resource); avoid enumerating IDs.
- Secrets via env (Docker/K8s secrets). Rotate API keys. Hash PII if logged.
- SQL safety: parameterized queries; read‑only role for BI; migrations via Prisma/Knex.

---

## 12) Error Model & API Versioning
- Standard error format:
```json
{ "error": "invalid_request", "message": "weights must sum to 100%", "code": 400 }
```
- Pagination keys: `page`, `limit`, `total`.
- Version with `/api/v1` and sunset headers for deprecations.

---

## 13) Deployment Topology
- **Environments**: dev → staging → prod.
- **Runtime**: Docker images for API and ML service; Postgres managed (Supabase/RDS); Redis managed (Upstash/ElastiCache).
- **Scaling**: API/Workers autoscale on CPU + queue depth; separate worker dynos.
- **Static SPA** on Vercel/S3+CloudFront.

---

## 14) CI/CD (GitHub Actions)
- Jobs: `lint`, `typecheck`, `unit`, `e2e` (Playwright), `docker build`, `db migrate`, `deploy`.
- Require green on `main` before deploy; feature branches → preview envs.

---

## 15) Testing Strategy
- **Unit**: metrics calc, adapters, validators.
- **Contract**: supertest against OpenAPI mocks.
- **Integration**: ephemeral Postgres (Testcontainers), Redis.
- **E2E**: seed synthetic prices; user flows (login → analyze → save → dashboard).

---

## 16) Performance Guidelines
- Use vectorized math (e.g., ndarray) for returns; avoid N+1 provider calls.
- Batch historical fetches per provider limits; gzip + HTTP/2.
- Prefer `jsonb` for flexible payloads; add materialized views for hot aggregates.

---

## 17) Risks & Mitigations
- **Provider rate limits** → caching, backoff, mirrors, nightly ETL to Postgres.
- **ML drift/overfit** → backtest on rolling windows, report accuracy/confidence.
- **Cost spikes** → quotas, trace egress, per‑user fair use limits.

---

## 18) Open Questions
- Should history be persisted long‑term (TimescaleDB) or cached on demand?
- SSE/WebSocket for live job updates—needed v1 or v2?
- Consolidate auth to Firebase only (no server JWT) or hybrid?

---

## 19) Roadmap (6 weeks)
- **W1–2**: Solidify DB schema, Redis cache, provider adapter, `/stocks/*` + `/portfolio/analyze` sync path.
- **W3**: Job queue + workers; async backtests; forecast plumbing.
- **W4**: AI Q&A + insights; persist Q/A; dashboard panels.
- **W5**: Observability + rate limiting + error model; staging soak.
- **W6**: SLOs, load test, polish UI, v1 release.

---

## 20) Appendix — Endpoint ↔ DB Touchpoints
- `POST /portfolio/analyze` → reads `price_history`; writes `portfolio_analyses`.
- `GET /portfolio/analysis/{id}` → reads `portfolio_analyses`.
- `POST /portfolio/save` → upserts `portfolio_analyses` (or links by `portfolio_id`).
- `GET /stocks/{ticker}/history` → read‑through cache of `price_history`.
- `POST /ai/ask` → writes `ai_questions`; reads `portfolio_analyses` for context.
- `POST /ai/forecast` → writes `forecasts`.

---

### Done. Ready for review & iteration.

