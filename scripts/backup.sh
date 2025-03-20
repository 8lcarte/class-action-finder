#!/bin/bash
# Automated Backup Script for Class Action Lawsuit Finder

# Exit on error
set -e

# Configuration
APP_NAME="class-action-finder"
BACKUP_DIR="/opt/backups/$APP_NAME"
DB_BACKUP_DIR="$BACKUP_DIR/database"
UPLOADS_BACKUP_DIR="$BACKUP_DIR/uploads"
LOGS_BACKUP_DIR="$BACKUP_DIR/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directories
mkdir -p $DB_BACKUP_DIR
mkdir -p $UPLOADS_BACKUP_DIR
mkdir -p $LOGS_BACKUP_DIR

# Backup database
echo "Backing up database..."
docker exec class-action-finder-app_db_1 pg_dump -U postgres -d class_action_finder > $DB_BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Compress database backup
gzip $DB_BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup uploads directory
echo "Backing up uploads..."
tar -czf $UPLOADS_BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz -C /opt/class-action-finder/current uploads

# Backup logs
echo "Backing up logs..."
tar -czf $LOGS_BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz -C /opt/class-action-finder/current/logs .

# Clean up old backups
echo "Cleaning up old backups..."
find $DB_BACKUP_DIR -name "db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find $UPLOADS_BACKUP_DIR -name "uploads_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find $LOGS_BACKUP_DIR -name "logs_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

# Optional: Upload to cloud storage (AWS S3)
if [ -n "$AWS_BACKUP_BUCKET" ]; then
  echo "Uploading backups to S3..."
  aws s3 cp $DB_BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz s3://$AWS_BACKUP_BUCKET/database/
  aws s3 cp $UPLOADS_BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz s3://$AWS_BACKUP_BUCKET/uploads/
  aws s3 cp $LOGS_BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz s3://$AWS_BACKUP_BUCKET/logs/
fi

echo "Backup completed successfully!"
