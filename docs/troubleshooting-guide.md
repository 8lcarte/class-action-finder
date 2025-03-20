# Troubleshooting Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Common Issues and Solutions](#common-issues-and-solutions)
3. [Frontend Troubleshooting](#frontend-troubleshooting)
4. [Backend Troubleshooting](#backend-troubleshooting)
5. [Database Troubleshooting](#database-troubleshooting)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Deployment Issues](#deployment-issues)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Getting Additional Help](#getting-additional-help)

## Introduction

This troubleshooting guide provides solutions for common issues that may arise when operating the Class Action Lawsuit Finder application. It is intended for system administrators, developers, and support staff responsible for maintaining the application.

## Common Issues and Solutions

### Application Not Starting

**Symptoms:**
- Docker containers fail to start
- Application returns 502 Bad Gateway
- Health check endpoint returns error

**Possible Causes and Solutions:**

1. **Docker Service Issues**
   ```bash
   # Check Docker service status
   systemctl status docker
   
   # Restart Docker if needed
   systemctl restart docker
   
   # Check container status
   docker ps -a
   ```

2. **Environment Configuration Issues**
   ```bash
   # Verify environment variables
   grep -r "SUPABASE_URL" .env.production
   
   # Check for missing or incorrect values
   diff .env.example .env.production
   ```

3. **Port Conflicts**
   ```bash
   # Check for port conflicts
   netstat -tulpn | grep 3000
   
   # Kill process using the port if needed
   kill -9 $(lsof -t -i:3000)
   ```

4. **Disk Space Issues**
   ```bash
   # Check disk space
   df -h
   
   # Clean up if needed
   docker system prune -f
   ```

### Database Connection Issues

**Symptoms:**
- Application logs show database connection errors
- API endpoints return 500 errors
- Health check shows database status as unhealthy

**Possible Causes and Solutions:**

1. **Supabase Credentials**
   ```bash
   # Verify Supabase credentials
   grep -r "SUPABASE" .env.production
   
   # Test connection
   curl -s "https://$SUPABASE_URL/rest/v1/" \
     -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY"
   ```

2. **Network Issues**
   ```bash
   # Check network connectivity
   ping $SUPABASE_URL
   
   # Check DNS resolution
   nslookup $SUPABASE_URL
   ```

3. **Rate Limiting or Quota Issues**
   - Check Supabase dashboard for usage metrics
   - Verify account status and limits
   - Implement connection pooling if needed

### Redis Connection Issues

**Symptoms:**
- Background jobs not processing
- Session management issues
- Cache misses

**Possible Causes and Solutions:**

1. **Redis Service Issues**
   ```bash
   # Check Redis service status
   docker exec -it redis redis-cli ping
   
   # Restart Redis if needed
   docker restart redis
   ```

2. **Redis Configuration**
   ```bash
   # Check Redis configuration
   docker exec -it redis cat /etc/redis/redis.conf
   
   # Verify connection settings
   grep -r "REDIS_URL" .env.production
   ```

3. **Memory Issues**
   ```bash
   # Check Redis memory usage
   docker exec -it redis redis-cli info memory
   
   # Clear Redis cache if needed
   docker exec -it redis redis-cli FLUSHALL
   ```

## Frontend Troubleshooting

### Page Loading Issues

**Symptoms:**
- Blank or partially loaded pages
- JavaScript console errors
- Missing styles or components

**Possible Causes and Solutions:**

1. **Build Issues**
   ```bash
   # Rebuild the frontend
   npm run build
   
   # Check for build errors
   cat .next/build-manifest.json
   ```

2. **JavaScript Errors**
   - Check browser console for errors
   - Verify that all required assets are loading
   - Check for CORS issues in network tab

3. **CSS Issues**
   - Verify that Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Ensure dark mode is properly implemented

### Browser Compatibility Issues

**Symptoms:**
- Application works in some browsers but not others
- Layout issues in specific browsers
- Features not working in older browsers

**Possible Causes and Solutions:**

1. **Unsupported Browser Features**
   - Check browser compatibility for used features
   - Implement polyfills for older browsers
   - Add browser detection and warning for unsupported browsers

2. **CSS Compatibility**
   - Use autoprefixer for vendor prefixes
   - Test in multiple browsers
   - Implement fallbacks for advanced CSS features

3. **JavaScript Compatibility**
   - Use Babel for transpiling modern JavaScript
   - Avoid using unsupported APIs without polyfills
   - Test in multiple browsers and versions

## Backend Troubleshooting

### API Endpoint Issues

**Symptoms:**
- API endpoints return errors
- Unexpected response formats
- Timeouts on specific endpoints

**Possible Causes and Solutions:**

1. **Route Configuration**
   ```bash
   # Check API routes
   grep -r "api/" src/
   
   # Verify route handlers
   cat src/pages/api/[endpoint].ts
   ```

2. **Request Validation**
   - Check request validation logic
   - Verify that required parameters are provided
   - Test with valid and invalid requests

3. **Error Handling**
   - Implement proper error handling
   - Check for uncaught exceptions
   - Add detailed error logging

### Background Job Issues

**Symptoms:**
- Jobs not processing
- Stuck or failed jobs
- Queue backlog

**Possible Causes and Solutions:**

1. **Worker Status**
   ```bash
   # Check worker container status
   docker ps | grep worker
   
   # Check worker logs
   docker logs worker
   ```

2. **Queue Configuration**
   ```bash
   # Check Redis queue status
   docker exec -it redis redis-cli LLEN bull:lawsuit-scraper:wait
   
   # Clear stuck jobs if needed
   docker exec -it redis redis-cli DEL bull:lawsuit-scraper:active
   ```

3. **Job Processing Logic**
   - Check job processor code
   - Verify error handling in jobs
   - Implement job retry logic

## Database Troubleshooting

### Query Performance Issues

**Symptoms:**
- Slow API responses
- Database CPU/memory high
- Timeout errors

**Possible Causes and Solutions:**

1. **Missing Indexes**
   ```sql
   -- Check existing indexes
   SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'lawsuits';
   
   -- Add missing indexes
   CREATE INDEX idx_lawsuits_court_filing_date ON lawsuits(court, filing_date);
   ```

2. **Inefficient Queries**
   ```sql
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM lawsuits WHERE court = 'Federal' AND filing_date > '2024-01-01';
   
   -- Optimize query
   SELECT id, name, case_number FROM lawsuits WHERE court = 'Federal' AND filing_date > '2024-01-01';
   ```

3. **Database Configuration**
   - Check connection pool settings
   - Verify database resource allocation
   - Consider read replicas for read-heavy workloads

### Data Integrity Issues

**Symptoms:**
- Inconsistent data
- Missing relationships
- Duplicate records

**Possible Causes and Solutions:**

1. **Constraint Violations**
   ```sql
   -- Check for orphaned records
   SELECT c.* FROM claims c LEFT JOIN lawsuits l ON c.lawsuit_id = l.id WHERE l.id IS NULL;
   
   -- Fix orphaned records
   DELETE FROM claims WHERE lawsuit_id NOT IN (SELECT id FROM lawsuits);
   ```

2. **Transaction Issues**
   - Verify transaction boundaries
   - Implement proper error handling in transactions
   - Use database constraints to enforce integrity

3. **Race Conditions**
   - Implement proper locking mechanisms
   - Use optimistic concurrency control
   - Add version columns for conflict detection

## Authentication Issues

### Login Problems

**Symptoms:**
- Users unable to log in
- Session expiration issues
- Unexpected logouts

**Possible Causes and Solutions:**

1. **Supabase Auth Configuration**
   ```bash
   # Check auth configuration
   grep -r "SUPABASE_AUTH" .env.production
   
   # Verify auth settings in Supabase dashboard
   ```

2. **Cookie Issues**
   - Check cookie settings (secure, httpOnly, sameSite)
   - Verify domain configuration
   - Check for cookie size limits

3. **JWT Token Issues**
   - Verify token expiration settings
   - Check for clock skew between servers
   - Implement proper token refresh logic

### Permission Issues

**Symptoms:**
- Access denied errors
- Users unable to perform actions they should have access to
- Unexpected authorization failures

**Possible Causes and Solutions:**

1. **Role-Based Access Control**
   ```sql
   -- Check user roles
   SELECT * FROM user_roles WHERE user_id = 'user-id';
   
   -- Verify role permissions
   SELECT * FROM role_permissions WHERE role = 'admin';
   ```

2. **Row-Level Security Policies**
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies;
   
   -- Test policy with specific user
   SET LOCAL ROLE authenticated;
   SET LOCAL "request.jwt.claims" TO '{"sub": "user-id"}';
   SELECT * FROM claims;
   ```

3. **JWT Claims**
   - Verify JWT token contains necessary claims
   - Check claim mapping to permissions
   - Implement proper claim validation

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Pages take more than 2 seconds to load
- High Time to First Byte (TTFB)
- Slow API responses

**Possible Causes and Solutions:**

1. **Server Performance**
   ```bash
   # Check server resource usage
   top
   
   # Monitor API response times
   grep "response_time" /var/log/nginx/access.log | awk '{sum+=$1; count++} END {print sum/count}'
   ```

2. **Database Performance**
   ```sql
   -- Check for slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **Caching Issues**
   - Verify Redis cache hit rate
   - Implement additional caching layers
   - Optimize cache invalidation strategy

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes with out-of-memory errors
- Degrading performance over time

**Possible Causes and Solutions:**

1. **Node.js Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Generate heap dump
   node --inspect=0.0.0.0:9229 server.js
   # Then use Chrome DevTools to capture heap snapshot
   ```

2. **Connection Leaks**
   - Check for unclosed database connections
   - Verify proper connection pooling
   - Implement connection timeout and cleanup

3. **Memory-Intensive Operations**
   - Optimize large data processing
   - Implement pagination for large datasets
   - Use streams for file processing

## Deployment Issues

### CI/CD Pipeline Failures

**Symptoms:**
- GitHub Actions workflow failures
- Deployment not completing
- Build errors

**Possible Causes and Solutions:**

1. **Build Errors**
   ```bash
   # Check build logs
   cat /var/log/github-actions/build.log
   
   # Verify build configuration
   cat .github/workflows/ci-cd.yml
   ```

2. **Dependency Issues**
   - Check for outdated or conflicting dependencies
   - Verify package lock file is committed
   - Use specific versions instead of ranges

3. **Environment Variables**
   - Verify all required secrets are configured
   - Check for environment-specific configuration
   - Test with local environment variables

### Docker Issues

**Symptoms:**
- Container fails to start
- Container exits unexpectedly
- Resource constraints

**Possible Causes and Solutions:**

1. **Image Build Issues**
   ```bash
   # Rebuild image with verbose output
   docker build -t class-action-finder:latest .
   
   # Check image layers
   docker history class-action-finder:latest
   ```

2. **Container Runtime Issues**
   ```bash
   # Check container logs
   docker logs class-action-finder-app
   
   # Check container resource usage
   docker stats class-action-finder-app
   ```

3. **Docker Compose Configuration**
   - Verify service dependencies
   - Check volume mounts and permissions
   - Verify network configuration

## Monitoring and Logging

### Using Logs for Troubleshooting

**Application Logs:**
```bash
# View application logs
docker logs class-action-finder-app

# Search for errors
docker logs class-action-finder-app | grep -i error

# Follow logs in real-time
docker logs -f class-action-finder-app
```

**Nginx Logs:**
```bash
# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log

# Filter by status code
grep " 500 " /var/log/nginx/access.log
```

**Database Logs:**
```bash
# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log

# Filter for slow queries
grep "duration:" /var/log/postgresql/postgresql.log
```

### Using Monitoring Tools

**Prometheus Metrics:**
- Access Prometheus at `http://monitoring.classactionfinder.com:9090`
- Use PromQL to query metrics
- Example queries:
  - `rate(http_request_duration_seconds_count[5m])` - Request rate
  - `http_request_duration_seconds_bucket{status_code="500"}` - Error rate
  - `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes` - Memory availability

**Grafana Dashboards:**
- Access Grafana at `http://monitoring.classactionfinder.com:3000`
- Use the following dashboards:
  - System Overview
  - API Performance
  - Database Performance
  - User Activity

## Getting Additional Help

If you're unable to resolve an issue using this guide, consider the following resources:

1. **Internal Documentation**
   - Review the architecture documentation
   - Check the API documentation
   - Consult the database schema documentation

2. **Support Channels**
   - Email: support@classactionfinder.com
   - Internal chat: #class-action-finder channel
   - Issue tracker: https://github.com/yourusername/class-action-finder/issues

3. **External Resources**
   - Next.js documentation: https://nextjs.org/docs
   - Supabase documentation: https://supabase.io/docs
   - Tailwind CSS documentation: https://tailwindcss.com/docs

4. **Escalation Process**
   - For critical issues, contact the on-call engineer
   - For data-related issues, contact the database administrator
   - For security incidents, follow the security incident response plan
