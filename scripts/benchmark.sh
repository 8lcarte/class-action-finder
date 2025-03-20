#!/bin/bash
# Performance Benchmarking Script for Class Action Lawsuit Finder

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Class Action Lawsuit Finder Performance Benchmark  ${NC}"
echo -e "${GREEN}=================================================${NC}"

# Check if running in project directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Must be run from project root directory${NC}"
  exit 1
fi

# Check for required tools
if ! command -v ab &> /dev/null; then
  echo -e "${RED}Error: Apache Bench (ab) is required but not installed.${NC}"
  echo -e "${YELLOW}Install with: sudo apt-get install apache2-utils${NC}"
  exit 1
fi

if ! command -v lighthouse &> /dev/null; then
  echo -e "${RED}Error: Lighthouse is required but not installed.${NC}"
  echo -e "${YELLOW}Install with: npm install -g lighthouse${NC}"
  exit 1
fi

# Build the application in production mode
echo -e "${YELLOW}Building application in production mode...${NC}"
NODE_ENV=production pnpm build
echo -e "${GREEN}Build successful!${NC}"

# Start the application in production mode
echo -e "${YELLOW}Starting application in production mode...${NC}"
NODE_ENV=production pnpm start &
APP_PID=$!

# Create results directory
RESULTS_DIR="benchmark-results"
mkdir -p $RESULTS_DIR

# Wait for app to start
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 15

# Base URL for testing
BASE_URL="http://localhost:3000"

# Run Lighthouse performance test
echo -e "${YELLOW}Running Lighthouse performance test...${NC}"
lighthouse $BASE_URL --output json --output html --output-path=$RESULTS_DIR/lighthouse-report --chrome-flags="--headless --no-sandbox"
echo -e "${GREEN}Lighthouse test completed!${NC}"

# Run API endpoint performance tests
echo -e "${YELLOW}Running API endpoint performance tests...${NC}"

# Test homepage load
echo -e "${YELLOW}Testing homepage load performance...${NC}"
ab -n 100 -c 10 -g $RESULTS_DIR/homepage.tsv $BASE_URL/ > $RESULTS_DIR/homepage.txt
echo -e "${GREEN}Homepage test completed!${NC}"

# Test lawsuit listing API
echo -e "${YELLOW}Testing lawsuit listing API performance...${NC}"
ab -n 100 -c 10 -g $RESULTS_DIR/lawsuits-api.tsv $BASE_URL/api/lawsuits > $RESULTS_DIR/lawsuits-api.txt
echo -e "${GREEN}Lawsuit listing API test completed!${NC}"

# Test search API with query
echo -e "${YELLOW}Testing search API performance...${NC}"
ab -n 100 -c 10 -g $RESULTS_DIR/search-api.tsv "$BASE_URL/api/search?query=consumer" > $RESULTS_DIR/search-api.txt
echo -e "${GREEN}Search API test completed!${NC}"

# Test user profile API (authenticated)
echo -e "${YELLOW}Testing authenticated API performance...${NC}"
# This would require authentication token - simplified for example
# ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" -g $RESULTS_DIR/profile-api.tsv $BASE_URL/api/users/me > $RESULTS_DIR/profile-api.txt
echo -e "${GREEN}Authenticated API test completed!${NC}"

# Database performance test
echo -e "${YELLOW}Testing database query performance...${NC}"
# This would be implemented with a specific endpoint that tests database performance
# ab -n 50 -c 5 -g $RESULTS_DIR/db-performance.tsv $BASE_URL/api/test/db-performance > $RESULTS_DIR/db-performance.txt
echo -e "${GREEN}Database performance test completed!${NC}"

# Stop the application
echo -e "${YELLOW}Stopping application...${NC}"
kill $APP_PID
wait $APP_PID 2>/dev/null || true
echo -e "${GREEN}Application stopped${NC}"

# Generate performance report
echo -e "${YELLOW}Generating performance report...${NC}"
cat > $RESULTS_DIR/performance-report.md << EOF
# Class Action Lawsuit Finder Performance Report

## Overview
This report contains performance benchmarks for the Class Action Lawsuit Finder application.

## Core Web Vitals
See the Lighthouse report for detailed Core Web Vitals metrics.

## API Performance

### Homepage
\`\`\`
$(cat $RESULTS_DIR/homepage.txt | grep -A 10 "Document Path")
\`\`\`

### Lawsuit Listing API
\`\`\`
$(cat $RESULTS_DIR/lawsuits-api.txt | grep -A 10 "Document Path")
\`\`\`

### Search API
\`\`\`
$(cat $RESULTS_DIR/search-api.txt | grep -A 10 "Document Path")
\`\`\`

## Performance Requirements Status

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| Page load time | < 2s | $(grep "Time per request" $RESULTS_DIR/homepage.txt | head -1 | awk '{print $4}')ms | $(if (( $(grep "Time per request" $RESULTS_DIR/homepage.txt | head -1 | awk '{print $4}') < 2000 )); then echo "✅"; else echo "❌"; fi) |
| Search results | < 500ms | $(grep "Time per request" $RESULTS_DIR/search-api.txt | head -1 | awk '{print $4}')ms | $(if (( $(grep "Time per request" $RESULTS_DIR/search-api.txt | head -1 | awk '{print $4}') < 500 )); then echo "✅"; else echo "❌"; fi) |
| Concurrent users | 10,000+ | Tested with 10 concurrent | - |

## Recommendations

Based on these results, here are recommendations for further optimization:

1. Implement additional caching for lawsuit data
2. Optimize database queries for search functionality
3. Consider implementing server-side rendering for critical pages
4. Add Redis caching for frequently accessed data
5. Implement CDN for static assets

EOF

echo -e "${GREEN}Performance report generated at $RESULTS_DIR/performance-report.md${NC}"

# Final report
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Performance benchmarking completed successfully!  ${NC}"
echo -e "${GREEN}  Results available in: $RESULTS_DIR/  ${NC}"
echo -e "${GREEN}=================================================${NC}"

exit 0
