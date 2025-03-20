#!/bin/bash
# Production Deployment Script for Class Action Lawsuit Finder

# Exit on error
set -e

# Configuration
APP_NAME="class-action-finder"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
GITHUB_REPO="https://github.com/yourusername/class-action-finder.git"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Class Action Lawsuit Finder Deployment  ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Create directories if they don't exist
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p $DEPLOY_DIR
mkdir -p $BACKUP_DIR

# Backup current deployment if it exists
if [ -d "$DEPLOY_DIR/current" ]; then
  echo -e "${YELLOW}Backing up current deployment...${NC}"
  tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $DEPLOY_DIR current
  echo -e "${GREEN}Backup created at $BACKUP_DIR/backup_$TIMESTAMP.tar.gz${NC}"
fi

# Create release directory
RELEASE_DIR="$DEPLOY_DIR/releases/$TIMESTAMP"
mkdir -p $RELEASE_DIR

# Clone repository
echo -e "${YELLOW}Cloning repository...${NC}"
git clone -b $BRANCH $GITHUB_REPO $RELEASE_DIR

# Copy environment variables
echo -e "${YELLOW}Setting up environment...${NC}"
if [ -f "$DEPLOY_DIR/.env.production" ]; then
  cp $DEPLOY_DIR/.env.production $RELEASE_DIR/.env
else
  echo -e "${RED}Warning: No .env.production file found. Please create one.${NC}"
  exit 1
fi

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
cd $RELEASE_DIR
docker-compose pull
docker-compose up -d

# Update symlink
echo -e "${YELLOW}Updating symlink...${NC}"
rm -f $DEPLOY_DIR/current
ln -s $RELEASE_DIR $DEPLOY_DIR/current

# Clean up old releases (keep last 5)
echo -e "${YELLOW}Cleaning up old releases...${NC}"
cd $DEPLOY_DIR/releases
ls -t | tail -n +6 | xargs -r rm -rf

# Clean up old Docker images
echo -e "${YELLOW}Cleaning up Docker images...${NC}"
docker system prune -af

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
if curl -s http://localhost:3000/health | grep -q "ok"; then
  echo -e "${GREEN}Deployment successful!${NC}"
else
  echo -e "${RED}Deployment verification failed. Please check logs.${NC}"
  echo -e "${YELLOW}Rolling back to previous version...${NC}"
  
  # Find previous release
  PREV_RELEASE=$(ls -t $DEPLOY_DIR/releases | sed -n 2p)
  if [ -n "$PREV_RELEASE" ]; then
    rm -f $DEPLOY_DIR/current
    ln -s $DEPLOY_DIR/releases/$PREV_RELEASE $DEPLOY_DIR/current
    cd $DEPLOY_DIR/releases/$PREV_RELEASE
    docker-compose up -d
    echo -e "${GREEN}Rolled back to previous version.${NC}"
  else
    echo -e "${RED}No previous version found. Manual intervention required.${NC}"
  fi
  
  exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
