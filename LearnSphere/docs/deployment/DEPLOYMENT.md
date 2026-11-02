# Skillfyme Deployment Guide

## Prerequisites

- Docker & Docker Compose
- kubectl + access to a Kubernetes cluster (EKS, GKE, AKS, OpenShift, or local)
- Helm 3+ (optional, for Helm-based deploy)
- GHCR access (`docker login ghcr.io`)

---

## 1. Docker Compose (Local / Dev)

```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f ui-backend

# Scale a service
docker-compose up -d --scale course-catalog=3

# Stop
docker-compose down

# Stop and remove volumes (reset databases)
docker-compose down -v
```

---

## 2. Kubernetes Deployment

### 2.1 Prerequisites

```bash
# Verify cluster access
kubectl cluster-info

# Create namespace
kubectl create namespace skillfyme

# Create secrets (replace placeholder values!)
kubectl create secret generic skillfyme-secrets \
  --from-literal=JWT_SECRET='your_32char_jwt_secret_here' \
  --from-literal=MONGODB_URI='mongodb://user:pass@mongodb:27017/skillfyme?authSource=admin' \
  --from-literal=DATABASE_URL='postgresql://user:pass@postgres:5432/skillfyme' \
  --from-literal=STRIPE_SECRET_KEY='sk_live_your_stripe_key' \
  --from-literal=SMTP_HOST='smtp.sendgrid.net' \
  --from-literal=SMTP_PORT='587' \
  --from-literal=SMTP_USER='apikey' \
  --from-literal=SMTP_PASS='your_sendgrid_api_key' \
  --from-literal=FROM_EMAIL='noreply@skillfyme.com' \
  -n skillfyme
```

### 2.2 Deploy with Kustomize

```bash
# Development overlay
kubectl apply -k k8s/overlays/dev

# Production overlay
kubectl apply -k k8s/overlays/prod

# Check rollout
kubectl rollout status deployment -n skillfyme

# Get all resources
kubectl get all -n skillfyme
```

### 2.3 Verify Deployment

```bash
# Port-forward for local testing
kubectl port-forward svc/ui-frontend 3000:3000 -n skillfyme
kubectl port-forward svc/ui-backend 4000:4000 -n skillfyme

# Check logs
kubectl logs -l app=ui-backend -n skillfyme -f

# Describe a failing pod
kubectl describe pod -l app=course-catalog -n skillfyme
```

### 2.4 Rollback

```bash
# Rollback a specific service
kubectl rollout undo deployment/ui-backend -n skillfyme

# Check rollout history
kubectl rollout history deployment/ui-backend -n skillfyme

# Rollback to specific revision
kubectl rollout undo deployment/ui-backend --to-revision=2 -n skillfyme
```

---

## 3. Production Checklist

### Security
- [ ] Replace all placeholder secrets with production values
- [ ] Enable Kubernetes Secrets encryption at rest (etcd)
- [ ] Configure Istio mTLS in STRICT mode
- [ ] Enable Network Policies (deny-all default, allow only necessary)
- [ ] Set `JWT_SECRET` to a cryptographically random 64-char string
- [ ] Configure Stripe live keys (not test keys)
- [ ] Enable SMTP TLS
- [ ] Configure rate limiting per environment

### Reliability
- [ ] Configure PodDisruptionBudgets (min 1 available per service)
- [ ] Configure resource requests and limits for all pods
- [ ] Configure liveness and readiness probes for all services
- [ ] Enable HPA for stateless services
- [ ] Configure MongoDB replica set (not standalone)
- [ ] Configure PostgreSQL with read replicas
- [ ] Enable Redis persistence (AOF + RDB)
- [ ] Configure Kafka replication factor > 1

### Observability
- [ ] Deploy Prometheus + Grafana stack
- [ ] Configure alerting rules (high error rate, high latency, pod restarts)
- [ ] Deploy Jaeger for distributed tracing
- [ ] Configure log shipping to centralized log store (ELK / Loki)
- [ ] Set up on-call rotation with PagerDuty/OpsGenie integration

### Performance
- [ ] Run load test: `k6 run scripts/load-test.js`
- [ ] Validate Redis cache hit rate > 80% for course catalog
- [ ] Validate p99 enrollment API latency < 500ms
- [ ] Tune MongoDB indexes for production query patterns

---

## 4. Database Migrations

### PostgreSQL (Alembic — learning-path service)

```bash
# Generate migration
cd services/learning-path
alembic revision --autogenerate -m "add_column_xyz"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

### MongoDB (No migrations — schema on write)
MongoDB uses schema-on-write. Mongoose validators enforce structure. Breaking schema changes require a data migration script.

---

## 5. Monitoring

### Prometheus
- Available at `http://prometheus:9090` (in-cluster) or `http://localhost:9090` (port-forwarded)

### Grafana
- Default credentials: `admin / admin` (change immediately)
- Pre-built dashboards imported from `monitoring/grafana/`

### Jaeger
- Available at `http://jaeger:16686`

### Alerting Rules (sample)

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  labels:
    severity: critical
  annotations:
    summary: "High error rate on {{ $labels.service }}"

# Enrollment service down
- alert: EnrollmentServiceDown
  expr: up{job="enrollment"} == 0
  labels:
    severity: critical
```
