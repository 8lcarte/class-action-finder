#!/bin/bash
# Final Testing Script for Class Action Lawsuit Finder

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Class Action Lawsuit Finder Final Test  ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if running in project directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Must be run from project root directory${NC}"
  exit 1
fi

# Run linting
echo -e "${YELLOW}Running linting tests...${NC}"
pnpm lint
echo -e "${GREEN}Linting passed!${NC}"

# Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
pnpm test
echo -e "${GREEN}Unit tests passed!${NC}"

# Build the application
echo -e "${YELLOW}Building application...${NC}"
pnpm build
echo -e "${GREEN}Build successful!${NC}"

# Start the application in test mode
echo -e "${YELLOW}Starting application in test mode...${NC}"
pnpm start:test &
APP_PID=$!

# Wait for app to start
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 10

# Run integration tests
echo -e "${YELLOW}Running integration tests...${NC}"
pnpm test:integration
echo -e "${GREEN}Integration tests passed!${NC}"

# Run e2e tests
echo -e "${YELLOW}Running end-to-end tests...${NC}"
pnpm test:e2e
echo -e "${GREEN}End-to-end tests passed!${NC}"

# Run accessibility tests
echo -e "${YELLOW}Running accessibility tests...${NC}"
pnpm test:a11y
echo -e "${GREEN}Accessibility tests passed!${NC}"

# Run security tests
echo -e "${YELLOW}Running security tests...${NC}"
pnpm test:security
echo -e "${GREEN}Security tests passed!${NC}"

# Stop the application
echo -e "${YELLOW}Stopping application...${NC}"
kill $APP_PID
wait $APP_PID 2>/dev/null || true
echo -e "${GREEN}Application stopped${NC}"

# Final report
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  All tests passed successfully!  ${NC}"
echo -e "${GREEN}=========================================${NC}"

exit 0
