# 🚀 Quick Start Guide - Fitness & Workout Tracker

## Overview

This guide will help you quickly understand the project structure and start implementing features to make it production-ready.

---

## 📁 Project Structure

```
fitness-tracker/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/fitness/
│   │   ├── config/                   # Security, JWT, App configs
│   │   ├── graphql/                  # GraphQL Resolvers
│   │   ├── model/                    # JPA Entity Models
│   │   ├── repository/               # Data Access Layer
│   │   ├── service/                  # Business Logic Layer
│   │   └── util/                     # Utilities (JWT, etc.)
│   ├── src/main/resources/
│   │   ├── application.yml           # App configuration
│   │   ├── db/migration/             # Flyway migrations
│   │   └── graphql/schema.graphqls   # GraphQL schema
│   ├── docker-compose.yml            # Local DB setup
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── (auth)/              # Auth pages (login, signup)
│   │   │   └── (dashboard)/         # Protected pages
│   │   ├── components/               # React components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   └── features/            # Feature components (empty)
│   │   ├── context/                  # React Context (auth)
│   │   ├── lib/                      # Utilities & GraphQL
│   │   │   └── graphql/             # GraphQL queries/mutations
│   │   └── types/                    # TypeScript types
│   └── package.json                  # NPM dependencies
│
├── PRODUCTION_ROADMAP.md             # Full implementation plan
├── TECHNICAL_ANALYSIS.md             # Detailed technical analysis
└── README.md                         # Project documentation
```

---

## ⚡ Quick Setup

### Prerequisites
- **Java:** 17 or higher
- **Node.js:** 18 or higher
- **Docker:** For PostgreSQL and Redis
- **Git:** For version control

### 1. Start Database Services
```bash
cd backend
docker-compose up -d

# Verify services are running
docker ps
# You should see: fitness_postgres and fitness_redis
```

### 2. Start Backend
```bash
cd backend

# Create environment file
cp .env.example .env

# Edit .env and set:
# - Database connection (default should work)
# - JWT secret (generate a secure one)
# - AWS credentials (for S3)

# Run backend
./mvnw spring-boot:run

# Backend will start on http://localhost:8080
# GraphiQL interface: http://localhost:8080/graphiql
```

### 3. Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8080/graphql

# Run frontend
npm run dev

# Frontend will start on http://localhost:3000
```

### 4. Test the Setup
1. Open http://localhost:3000
2. Click "Sign Up" and create an account
3. You should be redirected to the dashboard

---

## 🎯 What Works Now

### ✅ Working Features

**Authentication:**
- ✅ User signup
- ✅ User login
- ✅ JWT token generation
- ✅ Protected routes

**Workouts:**
- ✅ List workouts
- ✅ Basic workout creation (backend only)
- ✅ Delete workouts

**Exercises:**
- ✅ List exercises
- ✅ Search exercises

**Social:**
- ✅ Follow/unfollow users (backend only)
- ✅ Like functionality (backend only)
- ✅ Comments (backend only)

**Media:**
- ✅ S3 presigned URL generation

### ❌ Not Working / Incomplete

**Frontend:**
- ❌ Workout creation UI (incomplete)
- ❌ Feed page (not implemented)
- ❌ Profile page (incomplete)
- ❌ Social features UI (not implemented)
- ❌ Notifications (not implemented)
- ❌ File upload UI (not implemented)

**Backend:**
- ❌ Refresh token rotation
- ❌ Session management
- ❌ Rate limiting
- ❌ Caching
- ❌ DataLoader (N+1 queries exist)
- ❌ Proper error handling
- ❌ Input validation

**DevOps:**
- ❌ Tests (0% coverage)
- ❌ Docker configuration
- ❌ CI/CD pipeline
- ❌ Monitoring
- ❌ Infrastructure

---

## 🔥 Priority Implementation Order

### Phase 1: Security & Backend Core (CRITICAL)
**Estimated Time:** 1-2 weeks

```
1. Security Hardening
   ├── Move JWT secret to env vars ⚠️ CRITICAL
   ├── Implement refresh token rotation
   ├── Add input validation
   └── Add rate limiting

2. Error Handling
   ├── Create custom exceptions
   ├── Add GraphQL error resolver
   └── Proper error responses

3. Backend Completion
   ├── Complete NotificationService
   ├── Add SessionService
   ├── Implement DataLoader
   └── Add caching with Redis
```

**Start Here:**
```bash
# 1. Create branch
git checkout -b phase-1-security

# 2. Move JWT secret to env
# Edit: backend/src/main/resources/application.yml
# Remove hardcoded jwt.secret
# Add to .env: JWT_SECRET=your-secure-secret-here

# 3. Create custom exceptions
# Create: backend/src/main/java/com/fitness/exception/
```

### Phase 2: Frontend Features (HIGH)
**Estimated Time:** 1-2 weeks

```
1. Complete Workout Features
   ├── Workout creation form
   ├── Exercise selection UI
   └── Workout detail page

2. Social Features
   ├── Activity feed page
   ├── Follow/unfollow buttons
   ├── Like/unlike buttons
   └── Comment UI

3. Profile & Settings
   ├── Profile page
   ├── Profile editing
   └── Avatar upload
```

### Phase 3: Testing (HIGH)
**Estimated Time:** 1 week

```
1. Backend Tests
   ├── Unit tests (>80% coverage)
   ├── Integration tests
   └── GraphQL API tests

2. Frontend Tests
   ├── Component tests
   ├── Integration tests
   └── E2E tests
```

### Phase 4: DevOps (CRITICAL for Production)
**Estimated Time:** 2 weeks

```
1. Containerization
   ├── Backend Dockerfile
   ├── Frontend Dockerfile
   └── Docker compose for prod

2. CI/CD Pipeline
   ├── GitHub Actions workflows
   ├── Automated testing
   └── Automated deployment

3. Infrastructure
   ├── Terraform for AWS
   ├── Database setup
   └── Monitoring setup
```

---

## 🔍 Key Files to Review

### Backend Critical Files

**Security:**
- `backend/src/main/java/com/fitness/config/SecurityConfig.java`
- `backend/src/main/java/com/fitness/config/JwtAuthenticationFilter.java`
- `backend/src/main/java/com/fitness/util/JwtUtil.java`

**Services:**
- `backend/src/main/java/com/fitness/service/AuthService.java`
- `backend/src/main/java/com/fitness/service/WorkoutService.java`
- `backend/src/main/java/com/fitness/service/MediaService.java`

**GraphQL:**
- `backend/src/main/resources/graphql/schema.graphqls`
- `backend/src/main/java/com/fitness/graphql/QueryResolver.java`
- `backend/src/main/java/com/fitness/graphql/MutationResolver.java`

**Database:**
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- `backend/src/main/resources/application.yml`

### Frontend Critical Files

**Authentication:**
- `frontend/src/context/auth-context.tsx`
- `frontend/src/app/(auth)/login/page.tsx`

**GraphQL:**
- `frontend/src/lib/graphql/client.ts`
- `frontend/src/lib/graphql/queries.ts`
- `frontend/src/lib/graphql/mutations.ts`

**Pages:**
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/app/(dashboard)/workouts/page.tsx`
- `frontend/src/app/(dashboard)/exercises/page.tsx`

---

## 📚 Useful Commands

### Backend Commands
```bash
# Run backend
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests (when they exist)
./mvnw test

# Build JAR
./mvnw clean package

# Check for dependency updates
./mvnw versions:display-dependency-updates
```

### Frontend Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when they exist)
npm test
```

### Database Commands
```bash
# Access PostgreSQL
docker exec -it fitness_postgres psql -U postgres -d fitness_db

# View tables
\dt

# View table structure
\d users

# Run SQL query
SELECT * FROM users;

# Exit
\q
```

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Remove all data
docker-compose down -v
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend won't start
**Error:** "Unable to connect to database"
```bash
# Solution: Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
cd backend
docker-compose up -d postgres
```

### Issue 2: Frontend can't connect to backend
**Error:** "Network error" in browser console
```bash
# Solution 1: Check if backend is running
curl http://localhost:8080/graphql

# Solution 2: Check CORS configuration
# Edit: backend/src/main/java/com/fitness/config/SecurityConfig.java
# Verify: configuration.setAllowedOrigins(List.of("http://localhost:3000"))
```

### Issue 3: JWT authentication fails
**Error:** "Invalid token"
```bash
# Solution: Clear localStorage and try again
# Open browser console:
localStorage.clear()
# Then refresh and login again
```

### Issue 4: Flyway migration fails
**Error:** "Migration failed"
```bash
# Solution: Reset database
docker-compose down -v
docker-compose up -d

# Backend will recreate schema on startup
```

---

## 📊 Testing the Application

### Test GraphQL API Directly

Open GraphiQL at http://localhost:8080/graphiql

**Create User:**
```graphql
mutation {
  signup(input: {
    username: "testuser"
    email: "test@example.com"
    password: "Test123!"
    displayName: "Test User"
  }) {
    token
    username
  }
}
```

**Login:**
```graphql
mutation {
  login(input: {
    username: "testuser"
    password: "Test123!"
  }) {
    token
    username
  }
}
```

**Get Current User:**
```graphql
query {
  me {
    id
    username
    email
    displayName
  }
}
```

**Note:** Add Authorization header for authenticated requests:
```
Authorization: Bearer <your-token-here>
```

---

## 🎓 Learning Resources

### Spring Boot & GraphQL
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring for GraphQL](https://spring.io/projects/spring-graphql)
- [GraphQL Java](https://www.graphql-java.com/)

### Next.js & React
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Apollo Client](https://www.apollographql.com/docs/react/)

### Database
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Flyway Documentation](https://flywaydb.org/documentation/)

### DevOps
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Terraform](https://www.terraform.io/docs)

---

## 💡 Tips for Success

1. **Start Small:** Don't try to implement everything at once
2. **Test Often:** Run the app frequently to catch issues early
3. **Read Logs:** Backend logs are your friend for debugging
4. **Use Git:** Commit often with clear messages
5. **Follow the Plan:** Stick to the roadmap prioritization
6. **Security First:** Don't skip security fixes
7. **Document Changes:** Update README as you make changes

---

## 🤝 Getting Help

### Resources
1. **Documentation:** Read TECHNICAL_ANALYSIS.md for detailed analysis
2. **Roadmap:** Check PRODUCTION_ROADMAP.md for implementation steps
3. **Code Comments:** Look for TODOs in the codebase
4. **README:** Check the main README.md for features and architecture

### Common Questions

**Q: Where should I start?**
A: Start with Phase 1 security fixes - they're critical and foundational.

**Q: Can I skip testing?**
A: No! Testing is essential for production readiness and catches bugs early.

**Q: Should I implement features in a different order?**
A: The roadmap is optimized for dependencies, but adjust based on your needs.

**Q: How long will this take?**
A: With 1 developer: 8-10 weeks. With a team: 4-6 weeks. See roadmap for details.

---

## ✅ Daily Checklist

### Before Starting Work
- [ ] Pull latest changes from Git
- [ ] Start Docker services
- [ ] Verify backend is running
- [ ] Verify frontend is running
- [ ] Check for any errors in logs

### While Working
- [ ] Test changes immediately
- [ ] Write tests for new code
- [ ] Update documentation if needed
- [ ] Commit small, logical changes
- [ ] Follow code style guidelines

### Before Committing
- [ ] Run linter
- [ ] Run tests (when available)
- [ ] Test in browser
- [ ] Check for console errors
- [ ] Write clear commit message

---

## 🎉 Ready to Start!

You're now ready to begin implementing. Start with:

1. Review **TECHNICAL_ANALYSIS.md** for a deep understanding
2. Follow **PRODUCTION_ROADMAP.md** for implementation steps
3. Use this guide for quick reference and commands
4. Commit to quality and security from day one

**Good luck building your production-ready fitness tracker! 🚀**
