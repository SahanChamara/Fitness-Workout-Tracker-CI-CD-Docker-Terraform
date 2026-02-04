# Fitness & Workout Tracker

A full-stack fitness & workout tracker app built with **Next.js (TypeScript)** frontend and **Spring Boot (Java)** backend + **PostgreSQL**.  
This repo focuses on the frontend & backend implementation (GraphQL API, data models, UI, auth, media uploads). DevOps/infrastructure (Terraform, CI/CD, container registry, hosting) are implemented separately.
---

## Table of Contents

- [Project Overview](#project-overview)
- [Major Features](#major-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture-placeholder)
- [DevOps & CI/CD Workflows](#devops--cicd-workflows-what-this-project-uses--assumes)
- [Getting Started (Local Dev)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [GraphQL Endpoints & Examples](#graphql-endpoints--example-operations)
- [Testing](#testing)
- [Observability & Monitoring](#observability--monitoring)
- [Security & Best Practices](#security--best-practices)
- [Contributing](#contributing)
- [Roadmap / Future Work](#roadmap--future-work)
- [License](#license)

---

## Project Overview

**Fitness & Workout Tracker** is a modern single-page application + GraphQL backend that enables users to sign up, create workouts and routines, upload workout media, follow other users, like & comment, and view a cursor-paginated activity feed. The frontend is built with **Next.js** and **shadcn/ui** (Tailwind + Radix); all data fetching uses **TanStack Query** together with **graphql-request**. The backend is a **Spring Boot GraphQL** server using **PostgreSQL** and **Flyway** migrations.

This repo contains the full frontend and backend source code, GraphQL schema, migrations, and seed data for local development.

---

## Major Features

### User / Auth
- Signup, login, logout, refresh tokens (JWT + refresh)
- Profile edit (avatar via presigned S3 upload)
- Change password

### Workouts & Routines
- Create/read/update/delete workouts (multi-exercise)
- Live logging (start/pause/complete session) (MVP)
- Create and publish routines (ordered exercises)

### Social
- Follow / unfollow users
- Cursor-based feed with infinite scroll
- Like / comment on workouts & routines
- Notifications (GraphQL subscriptions support)

### Media
- Presigned S3 uploads (frontend PUT to S3)
- Client-side compression/validation

### Developer Concerns
- GraphQL schema with resolvers
- DataLoader for N+1 prevention
- Flyway for schema migrations
- Testcontainers for integration tests

---

## Tech Stack

### Frontend
- **Next.js** (App Router) + **TypeScript**
- **shadcn/ui** (Radix + Tailwind)
- **TanStack Query** (React Query) for all server state
- **graphql-request** for GraphQL calls
- **react-hook-form** + **zod** for forms & validation
- **dnd-kit** or **react-beautiful-dnd** for drag & drop
- **browser-image-compression** + **react-dropzone** for uploads

### Backend
- **Spring Boot 3.x** (Java 17/21)
- **Spring for GraphQL** (GraphQL schema + resolvers)
- **Spring Security** with JWT refresh rotation
- **Spring Data JPA** (Hibernate) + **PostgreSQL**
- **Flyway** for DB migrations
- **Redis** (for caching / rate-limiting / queueing, optional)
- **Testcontainers** for integration tests

### Other
- **Docker** for local dev & image builds
- **GitHub Actions** recommended for CI workflows (described below)

---

## Architecture (Placeholder)

> **Insert architecture diagram here.**  
> **Recommended:** place an SVG/PNG at `docs/architecture.svg` showing:
> - Next.js (SSR & static) behind CloudFront (or CDN)
> - ALB → Spring Boot GraphQL (ECS Fargate or K8s)
> - RDS PostgreSQL (private subnet)
> - S3 for media (presigned uploads)
> - Redis for caching & rate-limiting
> - Observability: Prometheus/Grafana, Loki, Sentry

*(A simple ASCII/Markdown diagram is included in `/docs/architecture.md` — replace with a visual later.)*

---

## DevOps & CI/CD Workflows (What This Project Uses / Assumes)

This project focuses on the **app code only**. The following DevOps workflows describe how the app is intended to be built and deployed — implement these manually in your infrastructure pipeline.

### PR CI Checks (Automated)

Run on each pull request:
- **Frontend:** `yarn lint`, `yarn test`, `yarn build`
- **Backend:** `mvn -DskipTests=false test`, `mvn -DskipTests=false -Pcheckstyle` (if used)
- Upload test artifacts & coverage reports to the PR

### Build & Push Images

On merge to `main`:
- Build container images (frontend and backend)
- Tag with commit SHA and semantic tag
- Push to registry (ECR or GHCR)

### Terraform Plan & Apply

Changes to `infrastructure/` run:
- `terraform fmt`, `terraform init`, and `terraform plan` in CI
- Post the plan to the PR for review
- `terraform apply` is gated (manual approval for production)

### Deploy to Staging

CI deploy job updates staging environment:
- Pull images from registry
- Update ECS / Kubernetes Deployment or run container
- Run DB migrations (Flyway) in a controlled way
- Run smoke tests against staging GraphQL endpoint

### Deploy to Production (Manual Gated)

- Use blue/green or rolling deployments
- Health checks and automated rollback on failing health checks
- Run Flyway migrations as one-off job (or ensure schema changes safe for zero-downtime), with DB backups beforehand

### Observability & Alerts

- Prometheus scrapes `/actuator/prometheus`; alerts via Alertmanager
- Loki for logs, Grafana dashboards for app metrics
- Sentry for error tracking (upload source maps in frontend CI)

### Secrets & Config

- Store secrets in Secrets Manager or similar; CI uses least privileged service principal
- Use environment-specific configuration (dev/staging/prod)

> **Note:** These workflows are described in `docs/devops/` and should be integrated into your CI/CD platform (GitHub Actions examples are included in `/ci/` skeleton).

---

## Getting Started (Local Development)

**Requires:** Node 18+, Yarn or npm, Java 17+, Maven/Gradle, Docker (for DB/Redis)

### 1. Clone

```bash
git clone https://github.com/<your-org>/fitness-tracker.git
cd fitness-tracker
```

### 2. Start Dev Dependencies (Docker)

```bash
docker compose -f docker/docker-compose.dev.yml up -d
# starts postgres, redis, minio (optional), localstack (optional)
```

### 3. Backend (Run)

```bash
cd backend
cp .env.example .env
# edit .env for DB connection if needed
./mvnw spring-boot:run
# or run from your IDE
# GraphQL endpoint: http://localhost:8080/graphql
```

### 4. Frontend (Run)

```bash
cd frontend
cp .env.local.example .env.local
yarn install
yarn dev
# open http://localhost:3000
```

### 5. Seed Data (Optional)

Run `backend/src/main/resources/db/seed/seed_data.sql` against local DB or use built-in profile that loads demo data.

---

## Environment Variables

### Backend (`backend/.env.example`)

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fitness
SPRING_DATASOURCE_USERNAME=dev
SPRING_DATASOURCE_PASSWORD=dev
JWT_SECRET=replace_with_secure_secret
AWS_REGION=ap-south-1
S3_BUCKET_MEDIA=fitness-media-dev
SENTRY_DSN=
REDIS_HOST=redis
```

### Frontend (`frontend/.env.local.example`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/graphql
NEXT_PUBLIC_S3_CDN=http://localhost:9000/ # if using MinIO locally
NEXT_PUBLIC_SENTRY_DSN=
```

> ⚠️ **Never commit actual secrets. Use `.env.example` files only.**

---

## GraphQL Endpoints & Example Operations

### Endpoint

```
POST http://localhost:8080/graphql
```

### Signup

```graphql
mutation {
  signup(username: "demo", email: "demo@example.com", password: "P@ssw0rd") {
    accessToken
    user { id username }
  }
}
```

### Create Workout

```graphql
mutation($input: CreateWorkoutInput!) {
  createWorkout(input: $input) {
    id title createdAt
  }
}
```

*`CreateWorkoutInput` contains `exercises` array and optional `mediaKeys`.*

### Presign Upload

```graphql
mutation {
  presignUpload(filename: "photo.jpg", contentType: "image/jpeg") {
    putUrl publicUrl key
  }
}
```

> 📄 Full schema available at `backend/src/main/resources/graphql/schema.graphqls`

---

## Testing

### Backend
- **Unit tests:** `./mvnw test`
- **Integration tests (Testcontainers):** run with Docker available

### Frontend
- **Unit tests:** `yarn test` (Jest + React Testing Library)
- **E2E tests:** `yarn e2e` (Cypress or Playwright)

> CI pipelines run these checks; ensure tests pass before merging.

---

## Observability & Monitoring

- Expose **Prometheus** metrics at `/actuator/prometheus` (backend)
- Log structured JSON to STDOUT to be shipped to **Loki** / **CloudWatch**
- **Frontend:** Sentry for runtime errors (upload source maps in CI)

### Create Grafana Dashboards For:
- Request latency & error rates
- DB connection usage
- CPU / memory for containers
- S3 upload errors

---

## Security & Best Practices

- Use **HTTPS in production**. Enforce HSTS and CSP headers
- Use `httpOnly`, `Secure`, `SameSite=Strict` cookies for refresh tokens if possible; store access token in memory
- Hash refresh tokens before storing in DB
- Validate and sanitize all inputs (server-side authoritative)
- Limit file upload size and validate MIME types
- Use DB migrations (Flyway) — version-controlled schema
- Enforce least-privilege IAM roles for any cloud resources

---

## Contributing

1. Fork the repo and create a feature branch: `feat/your-feature-name`
2. Make changes and add tests
3. Run tests & lint locally
4. Open a PR against `main` and ensure CI passes
5. Add a clear description and link to any related issue

See **CONTRIBUTING.md** for more details.

---

## Roadmap / Future Work

- [ ] Full DevOps pipeline: Terraform modules + GitHub Actions templates (infra already described)
- [ ] Blue/green / canary deployment patterns for safe releases
- [ ] Add advanced recommendation engine (ML) for suggestions
- [ ] Add mobile apps (React Native) and public API docs (GraphQL Playground / GraphiQL)

---

## License

This project is open source under the **MIT License** — see [LICENSE](LICENSE) for details.
