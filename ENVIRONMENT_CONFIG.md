# Environment Configuration Template

## Backend Environment Variables

Create a file named `.env` in the `backend/` directory:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fitness_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate a secure secret using: openssl rand -base64 64
JWT_SECRET=your-super-secure-jwt-secret-here-minimum-64-characters-recommended
JWT_EXPIRATION=86400000
# 1 day in milliseconds (86400000)

JWT_REFRESH_EXPIRATION=604800000
# 7 days in milliseconds (604800000)

# ============================================
# AWS S3 CONFIGURATION
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=fitness-tracker-media

# For local development with MinIO (optional)
# AWS_ENDPOINT_OVERRIDE=http://localhost:9000

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# APPLICATION CONFIGURATION
# ============================================
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_FITNESS=DEBUG

# ============================================
# MONITORING (Optional - for production)
# ============================================
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
# MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ============================================
# RATE LIMITING (To be implemented)
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_CAPACITY=100
RATE_LIMIT_REFILL_TOKENS=10
```

---

## Frontend Environment Variables

Create a file named `.env.local` in the `frontend/` directory:

```bash
# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080/graphql
# WebSocket URL for subscriptions (when implemented)

# ============================================
# MEDIA CONFIGURATION
# ============================================
NEXT_PUBLIC_MEDIA_CDN=https://your-cdn-url.cloudfront.net
# CloudFront or S3 bucket URL for media files

# For local development
# NEXT_PUBLIC_MEDIA_CDN=http://localhost:9000

# ============================================
# MONITORING (Optional - for production)
# ============================================
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
# SENTRY_AUTH_TOKEN=your-sentry-auth-token

# ============================================
# ANALYTICS (Optional)
# ============================================
# NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## Production Environment Configuration

### Backend Production (application-prod.yml)

Create `backend/src/main/resources/application-prod.yml`:

```yaml
spring:
  application:
    name: fitness-backend
  
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: false
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
    show-sql: false
  
  graphql:
    graphiql:
      enabled: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true
  
  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 60000
  
  cache:
    type: redis
    redis:
      time-to-live: 600000

server:
  port: ${SERVER_PORT:8080}
  shutdown: graceful
  tomcat:
    max-threads: 200
    min-spare-threads: 10

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
      base-path: /actuator
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    root: INFO
    com.fitness: INFO
    org.springframework.web: INFO
    org.hibernate: WARN
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss} - %msg%n'
    file: '%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n'
  file:
    name: /var/log/fitness-backend/application.log
    max-size: 10MB
    max-history: 30

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

aws:
  region: ${AWS_REGION}
  s3:
    bucket: ${S3_BUCKET_NAME}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS}
```

---

## Docker Compose Environment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: fitness-backend:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=${DATABASE_URL}
      - SPRING_DATASOURCE_USERNAME=${DATABASE_USERNAME}
      - SPRING_DATASOURCE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    ports:
      - "8080:8080"
    depends_on:
      - redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: fitness-frontend:latest
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
      - NEXT_PUBLIC_MEDIA_CDN=${MEDIA_CDN}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## AWS Secrets Manager Configuration

For production, use AWS Secrets Manager instead of environment variables:

### Backend Secrets (JSON format)

```json
{
  "database": {
    "url": "jdbc:postgresql://your-rds-endpoint:5432/fitness_db",
    "username": "admin",
    "password": "super-secure-password"
  },
  "jwt": {
    "secret": "your-super-secure-jwt-secret-minimum-64-characters",
    "expiration": 86400000,
    "refreshExpiration": 604800000
  },
  "aws": {
    "region": "us-east-1",
    "s3": {
      "bucket": "fitness-tracker-media-prod"
    }
  },
  "redis": {
    "host": "your-elasticache-endpoint",
    "port": 6379,
    "password": "redis-password"
  },
  "monitoring": {
    "sentryDsn": "https://your-sentry-dsn@sentry.io/project-id"
  }
}
```

### Frontend Secrets

```json
{
  "api": {
    "url": "https://api.yourapp.com/graphql",
    "wsUrl": "wss://api.yourapp.com/graphql"
  },
  "cdn": {
    "url": "https://d123456789.cloudfront.net"
  },
  "monitoring": {
    "sentryDsn": "https://your-sentry-dsn@sentry.io/project-id",
    "gaTrackingId": "G-XXXXXXXXXX"
  }
}
```

---

## Environment-Specific Configuration

### Development
```bash
# Use local database
# Enable GraphiQL
# Verbose logging
# Hot reload enabled
# CORS: localhost:3000
```

### Staging
```bash
# Use staging RDS
# Enable GraphiQL (with auth)
# INFO level logging
# Similar to production
# CORS: staging.yourapp.com
```

### Production
```bash
# Use production RDS (Multi-AZ)
# Disable GraphiQL
# INFO/WARN logging
# Optimized connection pooling
# CORS: yourapp.com
# Enable all monitoring
```

---

## Security Best Practices

### ✅ DO:
- Use AWS Secrets Manager or similar for production secrets
- Rotate JWT secrets regularly
- Use strong, unique passwords
- Enable encryption at rest for databases
- Use SSL/TLS for all connections
- Implement proper access controls

### ❌ DON'T:
- Never commit `.env` files to Git
- Never use default passwords in production
- Never expose secrets in logs
- Never use HTTP in production
- Never store secrets in code
- Never share production credentials

---

## Environment Validation Script

Create `scripts/validate-env.sh`:

```bash
#!/bin/bash

echo "Validating Backend Environment..."

required_vars=(
  "SPRING_DATASOURCE_URL"
  "SPRING_DATASOURCE_USERNAME"
  "SPRING_DATASOURCE_PASSWORD"
  "JWT_SECRET"
  "AWS_REGION"
  "S3_BUCKET_NAME"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set!"
else
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing_vars[@]}"
  exit 1
fi

# Validate JWT secret length
if [ ${#JWT_SECRET} -lt 64 ]; then
  echo "⚠️  JWT_SECRET should be at least 64 characters long"
fi

echo "Environment validation complete!"
```

---

## Quick Reference

### Generate Secrets

```bash
# Generate JWT Secret (64 bytes, base64)
openssl rand -base64 64

# Generate UUID
uuidgen

# Generate random password (32 characters)
openssl rand -base64 32

# Generate RSA key pair (for advanced JWT)
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

### Test Database Connection

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d fitness_db -c "SELECT version();"

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

### Test Backend

```bash
# Health check
curl http://localhost:8080/actuator/health

# Prometheus metrics
curl http://localhost:8080/actuator/prometheus
```

---

## Troubleshooting

### Issue: JWT Secret Too Short
```
Error: JWT secret must be at least 256 bits
Solution: Generate a longer secret using: openssl rand -base64 64
```

### Issue: Database Connection Failed
```
Error: Connection refused
Solution: Check if PostgreSQL is running and credentials are correct
```

### Issue: Redis Connection Failed
```
Error: Cannot connect to Redis
Solution: Verify Redis is running and host/port are correct
```

### Issue: S3 Access Denied
```
Error: Access Denied
Solution: Check AWS credentials and bucket permissions
```

---

## Next Steps

1. ✅ Copy environment templates to `.env` and `.env.local`
2. ✅ Replace placeholder values with actual configuration
3. ✅ Validate all required variables are set
4. ✅ Test connections to all external services
5. ✅ Never commit these files to Git!

For more information, see:
- [QUICK_START.md](./QUICK_START.md) for setup instructions
- [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md) for implementation plan
- [TECHNICAL_ANALYSIS.md](./TECHNICAL_ANALYSIS.md) for detailed analysis
