# Skillfyme Platform — Architecture Guide

## Overview

Skillfyme is a **polyglot microservice learning platform** composed of 10 independently deployable services. Each service owns its data, exposes a REST API, and communicates either synchronously (HTTP) or asynchronously (Kafka).

---

## System Architecture Diagram

```
                          Internet
                              │
                    ┌─────────▼──────────┐
                    │   Ingress / Nginx   │
                    │  (TLS termination)  │
                    └────────┬───────────┘
                             │
               ┌─────────────▼─────────────┐
               │        UI Frontend         │
               │     React 18 + Vite        │
               │    TailwindCSS + Radix      │
               └─────────────┬─────────────┘
                             │ /api/*
               ┌─────────────▼─────────────┐
               │         UI Backend         │
               │   Node.js 18 + Express     │
               │  BFF / API Gateway / Auth  │
               │    Redis Cart + Cache      │
               └──────┬──────────┬─────────┘
                      │          │
         ┌────────────┘          └────────────────────────┐
         │                                                │
  ┌──────▼──────┐  ┌──────────────┐  ┌───────────────┐  ┌▼──────────────┐
  │Course Catalog│  │Learning Path │  │Assessment Eng.│  │ Live Session  │
  │  Node.js 18  │  │  Python 3.11 │  │    Go 1.21    │  │  Node.js 18   │
  │   MongoDB    │  │  PostgreSQL  │  │  PostgreSQL   │  │   MongoDB     │
  │Elasticsearch │  │  FastAPI     │  │    Gin        │  │    Kafka      │
  └─────────────┘  └──────────────┘  └───────────────┘  └───────────────┘

  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
  │Credits/FX    │  │  Enrollment  │  │   Payment     │  │ Notification │
  │  Node.js 18  │  │  Node.js 18  │  │  Node.js 18   │  │  Node.js 18  │
  │    Redis     │  │  PostgreSQL  │  │  PostgreSQL   │  │  Nodemailer  │
  └──────────────┘  └──────────────┘  └───────────────┘  └──────────────┘

  ─────────────── Observability Stack ────────────────────────────────────
  Prometheus (metrics) │ Grafana (dashboards) │ Jaeger (tracing) │ Loki (logs)
```

---

## Service Responsibilities

### ui-frontend (Port 3000)
- **Role**: Learner-facing SPA
- **Stack**: React 18, Vite, TailwindCSS, Radix UI, Zustand, React Query
- **Key Features**: Course catalog, learning path discovery, live session booking, enrollment flow, dashboard
- **Routing**: React Router v6 with lazy loading and protected routes

### ui-backend (Port 4000)
- **Role**: Backend-for-Frontend (BFF) / API Gateway
- **Stack**: Node.js 18, Express, Redis (ioredis), jsonwebtoken
- **Key Features**: JWT auth, request aggregation, Redis cart, Redis API cache (5 min TTL), rate limiting, downstream error normalization

### course-catalog (Port 9101)
- **Role**: Course discovery and management
- **Stack**: Node.js 18, Express, Mongoose (MongoDB), Elasticsearch
- **Data**: Course documents with full-text search index
- **Key APIs**: list, search, featured, categories, CRUD

### learning-path (Port 9102)
- **Role**: Curated learning path bundles
- **Stack**: Python 3.11, FastAPI, SQLAlchemy async, asyncpg (PostgreSQL)
- **Data**: `learning_paths` table with JSONB course array

### assessment-engine (Port 9103)
- **Role**: Quiz, exam, and competency assessment execution
- **Stack**: Go 1.21, Gin, lib/pq (PostgreSQL)
- **Data**: `assessments`, `questions`, `attempts` tables
- **Key Feature**: Score calculation, pass/fail tracking, attempt limits

### live-session (Port 9104)
- **Role**: Live class, webinar, and mentoring session management
- **Stack**: Node.js 18, Express, Mongoose (MongoDB), Kafkajs
- **Data**: Session documents with capacity management
- **Events**: Publishes `session.booked` events to Kafka

### credits-currency (Port 9105)
- **Role**: Skillfyme credit system and FX conversion
- **Stack**: Node.js 18, Express, ioredis
- **Data**: Redis keys `credits:{userId}` with INCRBY/DECRBY operations
- **FX**: Static rates for 10 currencies (extensible to live FX API)

### enrollment (Port 9106)
- **Role**: Course enrollment and learning progress
- **Stack**: Node.js 18, Express, node-postgres (pg)
- **Data**: `enrollments` table with unique constraint (user_id, course_id)
- **Events**: Publishes `enrollment.created` and `enrollment.completed` to Kafka

### payment (Port 9107)
- **Role**: Payment processing and invoice management
- **Stack**: Node.js 18, Express, node-postgres (pg)
- **Data**: `payments` table; delegates to Stripe API for card processing
- **Events**: Publishes `payment.confirmed` to Kafka → triggers enrollment

### notification (Port 9108)
- **Role**: Email, SMS, and in-app notification delivery
- **Stack**: Node.js 18, Express, Nodemailer, Kafkajs
- **Templates**: enrollment_confirmation, payment_receipt, session_reminder
- **Trigger**: Kafka consumer subscribes to payment.confirmed, enrollment.created, session.booked

---

## Data Architecture

### Polyglot Persistence Strategy

| Database | Used By | Rationale |
|----------|---------|-----------|
| MongoDB | course-catalog, live-session | Flexible schemas, rich document queries, full-text search |
| PostgreSQL | learning-path, assessment-engine, enrollment, payment | ACID transactions, relational integrity, complex queries |
| Redis | ui-backend (cart/cache), credits-currency | Sub-millisecond reads, session state, counters |
| Elasticsearch | course-catalog | Full-text search, faceted filtering, relevance scoring |
| Kafka | live-session, enrollment, payment, notification | Event-driven decoupling, audit log, reliable delivery |

---

## Communication Patterns

### Synchronous (HTTP)
- UI Frontend → UI Backend (BFF proxy)
- UI Backend → All downstream services (service client)
- Downstream services do NOT call each other directly (avoid tight coupling)

### Asynchronous (Kafka)
- `payment.confirmed` → enrollment service creates enrollment → notification sends receipt
- `enrollment.created` → notification sends welcome email
- `session.booked` → notification sends session reminder
- `enrollment.completed` → certificate generation (future)

### Caching
- UI Backend caches: featured courses (5 min), categories (5 min), individual course (5 min)
- Cache keys: `courses:featured`, `courses:categories`, `course:{id}`
- Cache invalidation: TTL-based; explicit invalidation on course update

---

## Security Architecture

### Authentication & Authorization
- JWT issued by ui-backend `/api/auth/login` and `/api/auth/register`
- All protected routes require `Authorization: Bearer <token>`
- JWT payload: `{ sub, email, role }` — role-based access for admin routes
- Internal services trust `X-Internal-Service: ui-backend` header

### Network Security
- Services communicate on internal Kubernetes network — not exposed externally
- Only ui-frontend (port 3000) and ui-backend (port 4000) behind Ingress
- Istio mTLS encrypts all service-to-service traffic
- Secrets managed via Kubernetes Secrets (encrypted at rest with etcd encryption)

### Input Validation
- All user-facing inputs validated with Zod (Node.js) or Pydantic (Python)
- MongoDB queries use Mongoose casting — no raw string interpolation
- PostgreSQL uses parameterized queries (`$1, $2, ...`) — no SQL injection
- Rate limiting on auth endpoints (20 req/15min per IP)

---

## Observability

### Metrics (Prometheus)
Each service exposes `/metrics` with:
- HTTP request count, latency (histogram), error rate
- Database connection pool stats
- Custom business metrics (enrollment rate, payment success rate)

### Logging (Pino / structlog / zerolog)
All services emit structured JSON logs with:
- `service`, `level`, `timestamp`, `traceId`, `userId` (where applicable)
- Shipped to Loki via Promtail for aggregation in Grafana

### Distributed Tracing (Jaeger)
- OpenTelemetry SDK in each service
- Traces propagated via `traceparent` HTTP header
- Jaeger UI at `http://jaeger:16686`

### Grafana Dashboards
Pre-built dashboards:
- **Platform Overview**: Request rates, error rates, latencies per service
- **Business KPIs**: Enrollments/day, payment volume, active learners
- **Infrastructure**: CPU, memory, network per pod

---

## Deployment Architecture

```
                    GitHub (source)
                         │
              GitHub Actions CI/CD
                         │
                    GHCR (images)
                         │
              Kubernetes (EKS/GKE/OpenShift)
                         │
            ┌────────────┴────────────┐
            │                         │
     skillfyme-dev ns           skillfyme-prod ns
     (1 replica each)           (2-10 replicas, HPA)
```

### Environment Strategy

| Environment | Namespace | Trigger | Replicas |
|-------------|-----------|---------|----------|
| dev | skillfyme-dev | PR merge to develop | 1 per service |
| staging | skillfyme-staging | Release branch push | 1–2 per service |
| production | skillfyme | Tagged release | HPA (min 2) |

---

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo with Yarn Workspaces
**Decision**: Use a single monorepo with Yarn workspaces for all Node.js services.
**Rationale**: Shared tooling (ESLint, Prettier, test runner), atomic commits spanning services, easier local development with `concurrently`.

### ADR-002: Redis for Cart (Not PostgreSQL)
**Decision**: Store cart state in Redis with TTL-based expiry.
**Rationale**: Carts are temporary (not committed orders), high read/write rate, no complex queries needed. Redis INCRBY atomic operations prevent race conditions.

### ADR-003: MongoDB for Course Catalog (Not PostgreSQL)
**Decision**: Use MongoDB for courses and sessions.
**Rationale**: Flexible document structure (modules, topics vary per course), native full-text search, horizontal scaling via sharding.

### ADR-004: Python for Learning Path Service
**Decision**: Use FastAPI/Python for the learning-path service to maintain polyglot architecture.
**Rationale**: Demonstrates multi-language support; FastAPI's async capabilities and Pydantic v2 validation are strong for this read-heavy service.

### ADR-005: Go for Assessment Engine
**Decision**: Use Go/Gin for the assessment-engine.
**Rationale**: Assessment submissions are latency-sensitive; Go's performance characteristics and minimal memory footprint suit high-concurrency exam scenarios.
