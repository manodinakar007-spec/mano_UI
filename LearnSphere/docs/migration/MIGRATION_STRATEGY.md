# Skillfyme Migration Strategy
## From Bee Travels → Skillfyme Learning Platform

---

## Executive Summary

This document describes the complete strategy for transforming the **Bee Travels** polyglot microservice demo into the **Skillfyme Enterprise Learning Platform**. The transformation retains the architectural complexity, polyglot design patterns, and cloud-native deployment model of the original while introducing an entirely new business domain, data model, service topology, and UX.

---

## 1. Transformation Mapping

### 1.1 Service-to-Service Mapping

| Bee Travels Service | Skillfyme Service | Language | Primary Change |
|---------------------|------------------|----------|----------------|
| UI Frontend (React) | `ui-frontend` (React + Vite + TailwindCSS) | React 18 | Rebranded, Vite + TailwindCSS instead of CRA + Carbon |
| UI Backend (Express) | `ui-backend` (Express BFF) | Node.js 18 | New domain APIs, Redis cart, JWT auth |
| Destination Service | `course-catalog` | Node.js 18 | Travel destinations → Course catalog; MongoDB + ES |
| Hotel Service | `learning-path` | **Python** (FastAPI) | Hotel bundles → Learning paths; PostgreSQL |
| Car Rental Service | `assessment-engine` | **Go** (Gin) | Car rentals → Quizzes/exams; PostgreSQL |
| Flight Service | `live-session` | Node.js 18 | Flights → Live classes/webinars; MongoDB + Kafka |
| Currency Exchange | `credits-currency` | Node.js 18 | FX rates → Skillfyme credits + FX converter; Redis |
| Checkout Service | `enrollment` | Node.js 18 | Cart/checkout → Course enrollment; PostgreSQL |
| Payment Service | `payment` | Node.js 18 | Payment → Stripe-based payment; PostgreSQL |
| Email Service | `notification` | Node.js 18 | Email → Multi-channel notifications; Nodemailer + Kafka |

### 1.2 Domain Terminology Changes

| Bee Travels Term | Skillfyme Term |
|-----------------|----------------|
| Destination | Course / Skill Domain |
| Hotel | Learning Path / Bundle |
| Car Rental | Assessment / Quiz |
| Flight | Live Session / Webinar |
| Itinerary | Enrollment Cart |
| Booking | Enrollment |
| Traveler | Learner |
| Guest | Student |
| Hotel Rating | Course Rating |
| Hotel Room | Course Module |
| Car Type | Assessment Type |
| Flight Route | Learning Journey |
| Currency | Credits / Currency |
| Check-in/out | Session Start/End |
| Reservation | Enrollment Confirmation |

---

## 2. Migration Phases

### Phase 0 — Baseline (Week 0)
- Fork original Bee Travels repositories
- Document existing API contracts and data schemas
- Set up Skillfyme GitHub organization and container registry
- Provision development Kubernetes cluster
- Establish CI/CD baseline

### Phase 1 — Infrastructure Transformation (Weeks 1–2)
- Create new repository structure under `skillfyme/skillfyme-platform`
- Set up monorepo with Yarn workspaces
- Configure Docker Compose for local development
- Deploy infrastructure services (MongoDB, PostgreSQL, Redis, Kafka, Elasticsearch)
- Configure Kustomize overlays for dev/staging/prod
- Set up GitHub Actions CI/CD pipeline

### Phase 2 — Core Service Transformation (Weeks 3–5)
- **Week 3**: Transform UI Frontend + UI Backend
  - Replace Carbon Design System with TailwindCSS + Radix UI
  - Implement new navigation (Courses, Learning Paths, Live Sessions)
  - New BFF routes with Redis caching
  - JWT authentication
- **Week 4**: Transform Course Catalog (MongoDB) + Learning Path (Python/FastAPI)
  - New Course and Instructor data models
  - Learning Path PostgreSQL schema
  - Elasticsearch integration for full-text search
- **Week 5**: Transform Assessment Engine (Go) + Live Session (Node.js)
  - Assessment schema and attempt tracking
  - Session booking with capacity management
  - Kafka event publishing

### Phase 3 — Transaction Services (Weeks 6–7)
- Transform Credits & Currency service (Redis-backed credits system)
- Transform Enrollment service (PostgreSQL with conflict handling)
- Transform Payment service (Stripe integration)
- Transform Notification service (Nodemailer + email templates)

### Phase 4 — Observability & Security (Week 8)
- Configure Prometheus metrics across all services
- Set up Grafana dashboards
- Configure Jaeger distributed tracing
- Implement Istio service mesh policies
- Conduct security review (OWASP Top 10 compliance)
- Penetration testing

### Phase 5 — Data Migration & Seeding (Week 9)
- Generate realistic seed data for all services
- Load testing with k6 (target: 1000 concurrent users)
- Performance profiling and optimization

### Phase 6 — Production Readiness (Week 10)
- Final QA and regression testing
- Documentation review
- Runbook creation
- DR/failover testing
- Go-live cutover

---

## 3. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PostgreSQL schema conflicts between services | Medium | High | Run services in separate schemas within the same DB |
| Kafka lag causing notification delays | Low | Medium | DLQ + retry with exponential backoff |
| Redis data loss on restart | Low | Medium | Redis persistence (AOF) enabled in prod |
| Elasticsearch indexing out of sync with MongoDB | Medium | Medium | Dual-write pattern with eventual consistency |
| Stripe API rate limits during load tests | Low | Medium | Use Stripe test mode with mock keys |
| MongoDB connection pool exhaustion | Low | High | Pool size tuned per service; connection strings validated |

---

## 4. Rollback Plan

Each service is independently deployable. If any service fails:

1. `kubectl rollout undo deployment/<service-name> -n skillfyme`
2. Previous image tag is preserved in GHCR
3. Database migrations use Alembic (Python) / Liquibase-compatible scripts — roll back with `alembic downgrade -1`
4. Redis state is ephemeral for cart — no rollback needed
5. Kafka topics are persistent — consumers resume from last committed offset

---

## 5. Success Criteria

| Metric | Target |
|--------|--------|
| All services pass health checks | 100% |
| Course catalog search p99 latency | < 200ms |
| Enrollment API p99 latency | < 500ms |
| Payment success rate | > 99.5% |
| UI Time-to-Interactive (TTI) | < 3s on 3G |
| Container image size (each) | < 200MB |
| CI pipeline duration | < 15 minutes |
| Test coverage (unit + integration) | > 70% |
