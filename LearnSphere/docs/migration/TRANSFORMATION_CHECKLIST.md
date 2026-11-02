# Skillfyme Transformation Checklist

Track all source refactoring, testing, and validation tasks for the Bee Travels → Skillfyme migration.

---

## 1. Source Code Refactoring

### Global
- [x] Replace all `bee-travels` references with `skillfyme`
- [x] Replace all `Bee Travels` display text with `Skillfyme`
- [x] Update package names to `@skillfyme/*` scope
- [x] Update container image names to `ghcr.io/skillfyme/*`
- [x] Update all `PORT` environment variable assignments
- [x] Replace Travis CI config with GitHub Actions
- [x] Replace Carbon Design System with TailwindCSS + Radix UI
- [x] Replace hotel/destination/car/flight domain with course/path/assessment/session

### UI Frontend
- [x] Brand: Logo (Zap icon), colors (brand-600 blue), typography (Inter)
- [x] Pages: Home, Course Catalog, Course Detail, Learning Paths, Live Sessions, Dashboard, Enrollment, Checkout, Profile, Login, 404
- [x] Components: Navbar, Footer, CourseCard, LoadingSpinner
- [x] State: Zustand auth store with persistence
- [x] API client: Axios with JWT interceptors and per-domain methods
- [x] Router: React Router v6 with lazy loading and protected routes
- [x] Build: Vite config with API proxy to BFF

### UI Backend
- [x] Routes: /auth, /courses, /learning-paths, /live-sessions, /enrollments, /cart, /payments, /credits
- [x] Redis-backed cart with per-user storage
- [x] JWT middleware (verify + optional)
- [x] Service client factory with per-service axios instances
- [x] Rate limiting (auth: 20/15min, API: 200/min)
- [x] Error handler with structured logging (pino)
- [x] Health check aggregating downstream services

### Course Catalog (Node.js + MongoDB)
- [x] Mongoose Course schema with full-text indexes
- [x] Mongoose Instructor schema
- [x] Routes: GET /courses, /courses/featured, /courses/search, /courses/:id, POST /courses, PATCH /courses/:id
- [x] Categories route (aggregated from course data)
- [x] Seed data: 7 courses across 6 categories
- [x] Server: Express + Mongoose + pino

### Learning Path (Python + FastAPI)
- [x] SQLAlchemy async models (LearningPath)
- [x] Pydantic v2 schemas
- [x] FastAPI routes: GET /paths, GET /paths/:id, POST /paths, PATCH /paths/:id
- [x] Async PostgreSQL with asyncpg
- [x] Auto schema creation on startup

### Assessment Engine (Go + Gin)
- [x] PostgreSQL schema: assessments, questions, attempts
- [x] Handlers: list/get/create/update assessments, start/get/submit attempts, user results
- [x] CORS + request logger middleware
- [x] Schema auto-init on startup
- [x] Distroless final container image

### Live Session (Node.js + MongoDB)
- [x] Mongoose Session schema with capacity tracking
- [x] Routes: GET /sessions, GET /sessions/:id, POST /sessions, POST /sessions/:id/book
- [x] Seat capacity enforcement on booking

### Credits & Currency
- [x] Static FX rates (10 currencies)
- [x] FX conversion endpoint (GET /fx/convert)
- [x] FX rates endpoint (GET /fx/rates)
- [x] Redis-backed credit balance per user
- [x] Credits top-up (convert USD → credits)
- [x] Credits spend (deduct with balance check)

### Enrollment
- [x] PostgreSQL schema with unique constraint (user_id, course_id)
- [x] Routes: GET /enrollments/user/:userId, POST /enrollments, PATCH /enrollments/:id/progress
- [x] ON CONFLICT upsert for re-enrollment
- [x] Progress 0–100 validation

### Payment
- [x] PostgreSQL payments table
- [x] Routes: POST /payments/intent, POST /payments/:id/confirm, GET /payments/user/:userId
- [x] Stripe integration placeholder (replace `sk_test_*` with real key in prod)

### Notification
- [x] Nodemailer SMTP transport
- [x] Email templates: enrollment_confirmation, payment_receipt, session_reminder
- [x] Routes: POST /notifications/email, POST /notifications/send
- [x] Kafka consumer placeholder for event-driven notifications

---

## 2. Infrastructure

### Docker Compose
- [x] All 10 application services defined
- [x] Infrastructure: MongoDB, PostgreSQL, Redis, Elasticsearch, Kafka, Zookeeper
- [x] Health checks for MongoDB, PostgreSQL, Redis
- [x] Named volumes for data persistence
- [x] Shared `skillfyme-net` bridge network

### Kubernetes
- [x] Namespace: `skillfyme` with Istio injection label
- [x] ConfigMap: all service URLs, env vars
- [x] Secret: MongoDB URI, DB URL, JWT secret, Stripe key, SMTP credentials
- [x] Deployments + Services for all 10 services
- [x] HPA for ui-backend, course-catalog, enrollment
- [x] Ingress with TLS (cert-manager + Let's Encrypt)
- [x] Kustomize base + dev/prod overlays

### CI/CD
- [x] GitHub Actions CI: lint + test (Node.js, Python, Go) in matrix
- [x] Docker build + push to GHCR for all 10 services
- [x] Trivy security scan on main branch
- [x] GitHub Actions CD: kustomize deploy + rollout wait
- [x] Smoke tests post-deploy

---

## 3. Testing & Validation Checklist

### Pre-deployment
- [ ] `docker-compose up --build` completes without errors
- [ ] All 10 service containers reach healthy state
- [ ] MongoDB initialized with seed data
- [ ] PostgreSQL schema created with seed data
- [ ] Redis accessible from ui-backend and credits-currency

### API Validation
- [ ] `GET /health` returns 200 on all 10 services
- [ ] `GET /api/courses` returns paginated course list
- [ ] `GET /api/courses/featured` returns featured courses
- [ ] `POST /api/auth/register` creates user and returns JWT
- [ ] `POST /api/auth/login` returns JWT for valid credentials
- [ ] `GET /api/courses` with `Authorization: Bearer <token>` works
- [ ] `POST /api/enrollments` enrolls authenticated user
- [ ] `GET /api/enrollments/me` returns user enrollments
- [ ] `GET /api/learning-paths` returns paths from Python service
- [ ] `GET /api/live-sessions` returns upcoming sessions
- [ ] `POST /api/live-sessions/:id/book` books a session seat
- [ ] `GET /api/credits/balance` returns credits for user
- [ ] `POST /api/payments/intent` creates payment intent
- [ ] `POST /api/payments/:id/confirm` confirms payment

### UI Validation
- [ ] Home page renders with featured courses
- [ ] Course catalog loads and filters by level/category
- [ ] Login form registers new user and redirects to dashboard
- [ ] Dashboard shows enrolled courses with progress bars
- [ ] Learning paths page loads from Python service
- [ ] Live sessions page shows upcoming sessions
- [ ] Enrollment flow completes and adds course to dashboard

### Performance
- [ ] Course catalog loads < 200ms p50
- [ ] Featured courses cached in Redis (cache hit on 2nd request)
- [ ] Enrollment API handles 100 concurrent requests without errors

---

## 4. Deployment Verification Steps

```bash
# 1. Build all images
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Check all containers healthy
docker-compose ps

# 4. Verify each service health
for port in 3000 4000 9101 9102 9103 9104 9105 9106 9107 9108; do
  echo -n "Port $port: "
  curl -sf "http://localhost:$port/health" | jq -r '.status' || echo "FAIL"
done

# 5. Test course catalog
curl "http://localhost:9101/api/v1/courses" | jq '.total'

# 6. Test BFF aggregation
curl "http://localhost:4000/api/courses" | jq '.total'

# 7. Test auth flow
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@skillfyme.com","password":"password123"}' | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."

# 8. Test protected endpoint
curl "http://localhost:4000/api/enrollments/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 9. Kubernetes deploy (if cluster available)
kubectl apply -k k8s/overlays/dev
kubectl rollout status deployment -n skillfyme-dev --timeout=300s
```

---

## 5. Documentation Migration

| Bee Travels Doc | Skillfyme Equivalent | Status |
|----------------|---------------------|--------|
| Bee Travels README | Skillfyme README | ✅ Complete |
| Architecture diagrams | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) | ✅ Complete |
| API specs (Swagger) | [docs/api/](../api/) | ✅ Complete |
| Deployment guide | [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) | ✅ Complete |
| Developer guide | [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) | ✅ Complete |
| Migration strategy | [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md) | ✅ Complete |
| Transformation checklist | This document | ✅ Complete |
