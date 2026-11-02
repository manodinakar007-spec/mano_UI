# Skillfyme Developer Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | `nvm install 18` |
| Yarn | 2+ | `npm install -g yarn` |
| Python | 3.11+ | `pyenv install 3.11` |
| Go | 1.21+ | `brew install go` |
| Docker | 24+ | docker.com |
| Docker Compose | 2.20+ | included with Docker Desktop |
| kubectl | 1.28+ | `brew install kubectl` |

---

## Local Development

### Option A — Docker Compose (Recommended)

```bash
# Clone
git clone https://github.com/skillfyme/skillfyme-platform.git
cd skillfyme-platform

# Start all services + infrastructure
docker-compose up --build

# App is live at http://localhost:3000
# API at http://localhost:4000
```

### Option B — Run Services Locally

```bash
# Install all Node.js dependencies
yarn install

# Copy env files
for svc in services/*/; do
  [ -f "$svc.env.example" ] && cp "$svc.env.example" "$svc.env"
done

# Start infrastructure only
docker-compose up -d mongodb postgres redis kafka zookeeper elasticsearch

# Start all Node.js services
yarn dev

# For Python service (separate terminal)
cd services/learning-path
pip install -r requirements.txt
uvicorn src.main:app --port 9102 --reload

# For Go service (separate terminal)
cd services/assessment-engine
go run ./src/...
```

---

## Environment Variables

Each service has a `.env.example` file. Copy it to `.env` and fill in values.

### ui-backend
```env
PORT=4000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
COURSE_CATALOG_URL=http://localhost:9101
LEARNING_PATH_URL=http://localhost:9102
ASSESSMENT_ENGINE_URL=http://localhost:9103
LIVE_SESSION_URL=http://localhost:9104
CREDITS_CURRENCY_URL=http://localhost:9105
ENROLLMENT_URL=http://localhost:9106
PAYMENT_URL=http://localhost:9107
NOTIFICATION_URL=http://localhost:9108
JWT_SECRET=dev_secret_32chars_minimum_here
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Database Seeding

```bash
# MongoDB (courses + sessions)
# Auto-seeded via scripts/mongo-init.js on first container run

# PostgreSQL (learning paths + assessments)
# Auto-seeded via scripts/postgres-init.sql on first container run

# Manual seed (course-catalog)
yarn workspace @skillfyme/course-catalog seed
```

---

## Testing

```bash
# Run all tests
yarn test

# Test a specific service
yarn workspace @skillfyme/course-catalog test

# Watch mode
yarn workspace @skillfyme/ui-backend test:watch

# Python tests
cd services/learning-path
pytest

# Go tests
cd services/assessment-engine
go test ./src/...
```

---

## API Testing

```bash
# Health checks
curl http://localhost:4000/health | jq .

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# List courses
curl http://localhost:4000/api/courses | jq '.courses[0].title'

# Featured courses
curl http://localhost:4000/api/courses/featured | jq .

# Learning paths (via Python service)
curl http://localhost:4000/api/learning-paths | jq '.paths[].title'

# Live sessions
curl http://localhost:4000/api/live-sessions | jq .
```

---

## Code Conventions

### Node.js
- ES modules (`"type": "module"` in package.json)
- Pino for structured logging — no `console.log`
- Zod for input validation at service boundaries
- Express async error handling — pass `next(err)` in catch blocks

### Python
- Pydantic v2 for all schemas
- Async SQLAlchemy (not sync)
- structlog for logging
- Type hints required

### Go
- zerolog for structured logging
- All handlers in `handlers.go`
- Middleware in `middleware.go`
- `getEnv(key, fallback)` for env vars

### Git
- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit messages: `feat: add enrollment progress tracking`
- PR required for main; 1 review minimum

---

## Adding a New Service

1. Create `services/<service-name>/` directory
2. Add `package.json` with `@skillfyme/<service-name>` name
3. Add `src/server.js` (or equivalent for Python/Go)
4. Add `Dockerfile`
5. Add `.env.example`
6. Add service to `docker-compose.yml`
7. Add Deployment + Service to `k8s/base/microservices.yaml`
8. Add URL to `k8s/base/configmap.yaml`
9. Add service client in `services/ui-backend/src/utils/serviceClient.js`
10. Add matrix entry in `.github/workflows/ci.yml`
11. Add to root `package.json` workspaces (if Node.js)

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Cannot connect to MongoDB` | MongoDB not running | `docker-compose up -d mongodb` |
| `JWT invalid` | Wrong JWT_SECRET | Match secret in ui-backend and consuming service |
| `Redis ECONNREFUSED` | Redis not running | `docker-compose up -d redis` |
| `Course catalog 503` | MongoDB unhealthy | Check `docker-compose logs mongodb` |
| Python service 500 | DB migration not run | Tables auto-created on startup via SQLAlchemy |
| Go build fails | Missing go.sum | Run `go mod tidy` in assessment-engine/ |
| Kafka connection refused | Kafka not started | `docker-compose up -d zookeeper kafka` |
