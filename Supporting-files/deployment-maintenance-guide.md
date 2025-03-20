# Deployment and Maintenance Guide

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Deployment Options](#deployment-options)
4. [Initial Deployment](#initial-deployment)
5. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
6. [Database Management](#database-management)
7. [Monitoring and Alerting](#monitoring-and-alerting)
8. [Backup and Recovery](#backup-and-recovery)
9. [Scaling Considerations](#scaling-considerations)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance Tasks](#maintenance-tasks)

## Introduction

This guide provides comprehensive instructions for deploying, maintaining, and troubleshooting the Class Action Lawsuit Finder application. It is intended for DevOps engineers, system administrators, and technical staff responsible for the application's infrastructure.

## System Requirements

### Production Environment

- **CPU**: Minimum 4 cores, recommended 8+ cores
- **Memory**: Minimum 8GB RAM, recommended 16GB+ RAM
- **Storage**: Minimum 100GB SSD, recommended 500GB+ SSD
- **Operating System**: Ubuntu 20.04 LTS or newer
- **Network**: 100Mbps+ internet connection, public IP address
- **Docker**: Docker Engine 20.10.x or newer
- **Docker Compose**: version 2.x or newer

### Supporting Services

- **Database**: PostgreSQL 14+ (via Supabase)
- **Redis**: Version 6.2.x or newer
- **Elasticsearch**: Version 7.14.x or newer
- **Node.js**: Version 18.x LTS or newer (for build environment)

## Deployment Options

The Class Action Lawsuit Finder application supports multiple deployment options:

### 1. Docker Deployment (Recommended)

The application is containerized using Docker, making it easy to deploy in any environment that supports Docker and Docker Compose.

### 2. Cloud Provider Deployment

The application can be deployed to major cloud providers:

- **AWS**: Using ECS, EKS, or EC2 instances
- **Google Cloud**: Using GKE or Compute Engine
- **Azure**: Using AKS or Virtual Machines

### 3. Kubernetes Deployment

For large-scale deployments, Kubernetes configurations are provided for orchestrating the application containers.

## Initial Deployment

### Prerequisites

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/class-action-finder.git
   cd class-action-finder
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.production
   ```
   
   Edit `.env.production` with your production settings:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Redis Configuration
   REDIS_URL=redis://redis:6379
   
   # Elasticsearch Configuration
   ELASTICSEARCH_URL=http://elasticsearch:9200
   
   # Email Configuration
   EMAIL_FROM=notifications@classactionfinder.com
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-user
   SMTP_PASSWORD=your-smtp-password
   
   # Application Configuration
   NODE_ENV=production
   APP_URL=https://classactionfinder.com
   API_URL=https://api.classactionfinder.com
   ```

### Docker Deployment

1. Build and start the containers:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
   ```

2. Initialize the database:
   ```bash
   docker-compose exec app npx wrangler d1 migrations apply DB --local
   ```

3. Verify the deployment:
   ```bash
   curl http://localhost:3000/health
   ```

### Cloud Provider Deployment

#### AWS Deployment

1. Configure AWS CLI:
   ```bash
   aws configure
   ```

2. Deploy using the provided script:
   ```bash
   ./scripts/deploy-aws.sh
   ```

#### Google Cloud Deployment

1. Configure gcloud CLI:
   ```bash
   gcloud auth login
   gcloud config set project your-project-id
   ```

2. Deploy using the provided script:
   ```bash
   ./scripts/deploy-gcp.sh
   ```

#### Azure Deployment

1. Configure Azure CLI:
   ```bash
   az login
   az account set --subscription your-subscription-id
   ```

2. Deploy using the provided script:
   ```bash
   ./scripts/deploy-azure.sh
   ```

## Continuous Integration/Continuous Deployment

The application includes a complete CI/CD pipeline configuration using GitHub Actions.

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/ci-cd.yml` and includes:

1. **Testing**: Runs linting and unit tests
2. **Building**: Builds the application and Docker images
3. **Deployment**: Deploys to staging and production environments

### Setting Up CI/CD

1. Configure the following secrets in your GitHub repository:
   - `DOCKERHUB_USERNAME`: DockerHub username
   - `DOCKERHUB_TOKEN`: DockerHub access token
   - `SSH_PRIVATE_KEY`: SSH private key for deployment
   - `KNOWN_HOSTS`: SSH known hosts
   - `STAGING_SSH_USER`: SSH user for staging server
   - `STAGING_HOST`: Staging server hostname
   - `PRODUCTION_SSH_USER`: SSH user for production server
   - `PRODUCTION_HOST`: Production server hostname

2. Push changes to the `main` branch to trigger the CI/CD pipeline.

## Database Management

### Migrations

Database migrations are managed using SQL files in the `migrations/` directory.

To apply migrations:

```bash
docker-compose exec app npx wrangler d1 migrations apply DB --local
```

To create a new migration:

```bash
touch migrations/$(date +%Y%m%d%H%M%S)_description.sql
```

### Seeding Data

Seed data is provided in `migrations/0003_seed_data.sql`.

To seed the database:

```bash
docker-compose exec app npx wrangler d1 execute DB --local --file=migrations/0003_seed_data.sql
```

### Backup and Restore

To backup the database:

```bash
./scripts/backup.sh
```

To restore from a backup:

```bash
./scripts/restore.sh /opt/backups/class-action-finder/database/db_backup_20250320_120000.sql.gz
```

## Monitoring and Alerting

The application includes a comprehensive monitoring setup using Prometheus, Grafana, and Alertmanager.

### Starting Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Accessing Monitoring Dashboards

- **Prometheus**: http://your-server:9090
- **Grafana**: http://your-server:3001 (default credentials: admin/classactionfinder)
- **Alertmanager**: http://your-server:9093

### Alert Configuration

Alerts are configured in `monitoring/prometheus/alert_rules.yml` and include:

- High CPU/Memory/Disk usage
- Service downtime
- High response times
- High error rates

### Custom Dashboards

Custom Grafana dashboards are provided in `monitoring/grafana/provisioning/dashboards/`.

## Backup and Recovery

### Automated Backups

The application includes an automated backup script that backs up:

- Database
- Uploaded files
- Application logs

To set up automated backups:

1. Configure backup settings in `.env.production`:
   ```
   BACKUP_RETENTION_DAYS=30
   AWS_BACKUP_BUCKET=classactionfinder-backups
   ```

2. Add the backup script to crontab:
   ```bash
   crontab -e
   ```
   
   Add the following line to run backups daily at 2 AM:
   ```
   0 2 * * * /opt/class-action-finder/current/scripts/backup.sh >> /var/log/backup.log 2>&1
   ```

### Disaster Recovery

In case of a disaster:

1. Set up a new server with the same prerequisites
2. Clone the repository
3. Restore the database from the latest backup
4. Restore uploaded files from the latest backup
5. Deploy the application

## Scaling Considerations

### Horizontal Scaling

The application is designed to scale horizontally:

1. **Web Tier**: Add more app containers behind a load balancer
2. **Worker Tier**: Add more worker containers for background processing
3. **Database Tier**: Use Supabase's scaling capabilities or migrate to a self-hosted PostgreSQL cluster
4. **Redis**: Set up Redis Sentinel or Redis Cluster for high availability
5. **Elasticsearch**: Set up an Elasticsearch cluster with multiple nodes

### Vertical Scaling

For smaller deployments, vertical scaling can be effective:

1. Increase CPU and memory allocations for containers
2. Upgrade server specifications
3. Optimize database queries and indexes

### CDN Integration

For improved performance, integrate with a CDN:

1. Configure your CDN to cache static assets
2. Update `next.config.js` with your CDN domain
3. Set appropriate cache headers for static assets

## Troubleshooting

### Common Issues

#### Application Not Starting

1. Check Docker container logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables are set correctly
3. Check if all required services (Redis, Elasticsearch) are running

#### Database Connection Issues

1. Verify Supabase credentials in `.env.production`
2. Check if Supabase service is accessible from your server
3. Check network configuration and firewall rules

#### High CPU/Memory Usage

1. Check monitoring dashboards for the source of the issue
2. Consider scaling up resources or optimizing code
3. Look for memory leaks or inefficient queries

#### Slow Response Times

1. Check database query performance
2. Verify Elasticsearch is properly indexed
3. Check for network latency issues
4. Consider enabling or optimizing caching

### Logs

Application logs are available in the following locations:

- **Application Logs**: `docker-compose logs app`
- **Worker Logs**: `docker-compose logs worker`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `journalctl -u docker`

### Support

For additional support:

- **GitHub Issues**: https://github.com/yourusername/class-action-finder/issues
- **Email Support**: support@classactionfinder.com

## Maintenance Tasks

### Regular Maintenance

1. **Weekly Tasks**:
   - Review monitoring dashboards
   - Check disk space usage
   - Verify backup integrity

2. **Monthly Tasks**:
   - Apply security updates
   - Review and optimize database indexes
   - Clean up old Docker images and containers

3. **Quarterly Tasks**:
   - Perform load testing
   - Review and update scaling strategy
   - Audit security configurations

### Version Updates

When updating to a new version:

1. Review the changelog for breaking changes
2. Test the update in a staging environment
3. Backup the production environment
4. Deploy using the zero-downtime deployment script:
   ```bash
   ./scripts/deploy.sh
   ```
5. Verify the update was successful
6. If issues occur, roll back using the deployment script's rollback feature

### Security Updates

For critical security updates:

1. Apply the update as soon as possible
2. Follow the version update procedure
3. Document the security issue and resolution
4. Consider notifying users if the issue was significant
