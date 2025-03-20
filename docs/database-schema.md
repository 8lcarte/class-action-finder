# Database Schema Documentation

## Overview

The Class Action Lawsuit Finder application uses Supabase (PostgreSQL) as its primary database. This document provides a comprehensive overview of the database schema, including tables, relationships, indexes, and security policies.

## Tables

### users

Stores user account information and profile data.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key, matches Supabase auth.users id | PK, NOT NULL |
| email | text | User's email address | UNIQUE, NOT NULL |
| name | text | User's full name | |
| address | text | User's address | |
| phone | text | User's phone number | |
| demographics | jsonb | User demographic information (age, location, etc.) | |
| preferences | jsonb | User preferences including notification settings | |
| privacy_settings | jsonb | User privacy controls | |
| account_tier | text | User's account tier (free/premium) | DEFAULT 'free' |
| action_history | jsonb[] | Array of user actions for personalization | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `users_email_idx` on `(email)` - For email lookups
- `users_account_tier_idx` on `(account_tier)` - For filtering by tier

**RLS Policies:**
- `users_select_own`: Users can only read their own data
- `users_update_own`: Users can only update their own data

### lawsuits

Stores information about class action lawsuits.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| name | text | Lawsuit name/title | NOT NULL |
| case_number | text | Legal case number | NOT NULL |
| court | text | Court where lawsuit was filed | NOT NULL |
| judge | text | Presiding judge | |
| settlement_info | jsonb | Settlement details including tier structure | |
| eligibility_criteria | jsonb | Structured eligibility requirements | |
| required_evidence | text[] | Array of required document types | |
| important_dates | jsonb | Key dates (filing, opt-out, hearings) | |
| success_metrics | jsonb | Statistics on payouts and approval rates | |
| source_info | jsonb | Source information and confidence score | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `lawsuits_name_idx` on `(name)` - For name searches
- `lawsuits_case_number_idx` on `(case_number)` - For case number lookups
- `lawsuits_court_idx` on `(court)` - For filtering by court
- `lawsuits_eligibility_criteria_idx` on `(eligibility_criteria)` using GIN - For JSON content searches

**RLS Policies:**
- `lawsuits_select_all`: Anyone can read lawsuit data
- `lawsuits_insert_admin`: Only admins can insert lawsuits
- `lawsuits_update_admin`: Only admins can update lawsuits
- `lawsuits_delete_admin`: Only admins can delete lawsuits

### defendants

Stores information about defendants in lawsuits.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| lawsuit_id | uuid | Reference to lawsuits table | FK, NOT NULL |
| company_name | text | Defendant company name | NOT NULL |
| company_info | jsonb | Company details (industry, revenue, etc.) | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `defendants_lawsuit_id_idx` on `(lawsuit_id)` - For joining with lawsuits
- `defendants_company_name_idx` on `(company_name)` - For company name searches

**Foreign Keys:**
- `lawsuit_id` references `lawsuits(id)` ON DELETE CASCADE

**RLS Policies:**
- `defendants_select_all`: Anyone can read defendant data
- `defendants_insert_admin`: Only admins can insert defendants
- `defendants_update_admin`: Only admins can update defendants
- `defendants_delete_admin`: Only admins can delete defendants

### claims

Stores user claims for lawsuits.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| user_id | uuid | Reference to users table | FK, NOT NULL |
| lawsuit_id | uuid | Reference to lawsuits table | FK, NOT NULL |
| status | text | Claim status | NOT NULL, DEFAULT 'draft' |
| status_history | jsonb[] | History of status changes with timestamps | |
| documents | jsonb[] | Array of document references with verification status | |
| eligibility_answers | jsonb | User responses to eligibility questions | |
| estimated_payout_range | jsonb | Min/max estimated payout | |
| priority_score | float | Calculated priority/probability score | |
| communication_history | jsonb[] | History of communications | |
| resolution_details | jsonb | Details about claim resolution | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `claims_user_id_idx` on `(user_id)` - For user's claims
- `claims_lawsuit_id_idx` on `(lawsuit_id)` - For lawsuit's claims
- `claims_status_idx` on `(status)` - For filtering by status

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE
- `lawsuit_id` references `lawsuits(id)` ON DELETE CASCADE

**RLS Policies:**
- `claims_select_own`: Users can only read their own claims (admins can read all)
- `claims_insert_own`: Users can only insert their own claims
- `claims_update_own`: Users can only update their own claims (admins can update all)
- `claims_delete_own`: Users can only delete their own claims (admins can delete all)

### data_sources

Stores information about lawsuit data sources.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| name | text | Source name | NOT NULL |
| url | text | Source URL | NOT NULL |
| reliability_metrics | jsonb | Metrics on source reliability | |
| scraping_config | jsonb | Configuration for web scraper | |
| data_mapping | jsonb | Field mapping configuration | |
| success_history | jsonb | History of successful/failed scrapes | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `data_sources_name_idx` on `(name)` - For name lookups
- `data_sources_url_idx` on `(url)` - For URL lookups

**RLS Policies:**
- `data_sources_select_admin`: Only admins can read data sources
- `data_sources_insert_admin`: Only admins can insert data sources
- `data_sources_update_admin`: Only admins can update data sources
- `data_sources_delete_admin`: Only admins can delete data sources

### saved_searches

Stores user-saved searches.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| user_id | uuid | Reference to users table | FK, NOT NULL |
| search_query | jsonb | Search parameters | NOT NULL |
| notification_enabled | boolean | Whether notifications are enabled | DEFAULT false |
| notification_frequency | text | Notification frequency (daily, weekly, etc.) | |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `saved_searches_user_id_idx` on `(user_id)` - For user's saved searches

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

**RLS Policies:**
- `saved_searches_select_own`: Users can only read their own saved searches
- `saved_searches_insert_own`: Users can only insert their own saved searches
- `saved_searches_update_own`: Users can only update their own saved searches
- `saved_searches_delete_own`: Users can only delete their own saved searches

### user_notifications

Stores user notifications.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| user_id | uuid | Reference to users table | FK, NOT NULL |
| type | text | Notification type | NOT NULL |
| content | text | Notification content | NOT NULL |
| data | jsonb | Additional notification data | |
| read | boolean | Whether notification has been read | DEFAULT false |
| created_at | timestamptz | Record creation timestamp | DEFAULT now() |
| updated_at | timestamptz | Record update timestamp | DEFAULT now() |

**Indexes:**
- `user_notifications_user_id_idx` on `(user_id)` - For user's notifications
- `user_notifications_read_idx` on `(read)` - For filtering by read status

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

**RLS Policies:**
- `user_notifications_select_own`: Users can only read their own notifications
- `user_notifications_insert_admin`: Only admins can insert notifications
- `user_notifications_update_own`: Users can only update their own notifications
- `user_notifications_delete_own`: Users can only delete their own notifications

### audit_logs

Stores security audit logs.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | PK, NOT NULL, DEFAULT uuid_generate_v4() |
| user_id | uuid | Reference to users table | FK, NOT NULL |
| operation | text | Operation performed | NOT NULL |
| details | jsonb | Operation details | |
| ip_address | text | User's IP address | |
| timestamp | timestamptz | When operation occurred | DEFAULT now() |

**Indexes:**
- `audit_logs_user_id_idx` on `(user_id)` - For user's audit logs
- `audit_logs_operation_idx` on `(operation)` - For filtering by operation type
- `audit_logs_timestamp_idx` on `(timestamp)` - For time-based queries

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

**RLS Policies:**
- `audit_logs_select_admin`: Only admins can read audit logs
- `audit_logs_insert_system`: Only system can insert audit logs

## Database Functions

### update_updated_at()

Trigger function to automatically update the `updated_at` timestamp when a record is modified.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### check_claim_eligibility(claim_id uuid)

Function to check if a claim meets the eligibility criteria of its associated lawsuit.

```sql
CREATE OR REPLACE FUNCTION check_claim_eligibility(claim_id uuid)
RETURNS boolean AS $$
DECLARE
  v_claim claims;
  v_lawsuit lawsuits;
  v_eligible boolean := true;
BEGIN
  -- Get claim and associated lawsuit
  SELECT * INTO v_claim FROM claims WHERE id = claim_id;
  SELECT * INTO v_lawsuit FROM lawsuits WHERE id = v_claim.lawsuit_id;
  
  -- Check eligibility based on criteria and answers
  -- This is a simplified version, actual implementation would be more complex
  
  RETURN v_eligible;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### update_updated_at_trigger

Applied to all tables with an `updated_at` column to automatically update the timestamp on record modification.

```sql
CREATE TRIGGER update_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Similar triggers for other tables
```

## Entity Relationship Diagram

```
users 1--* claims *--1 lawsuits 1--* defendants
lawsuits *--* data_sources
users 1--* saved_searches
users 1--* user_notifications
users 1--* audit_logs
```

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed.
2. **JSON Indexing**: GIN indexes are used for JSONB columns that will be queried.
3. **Partitioning**: For large tables like `claims` and `audit_logs`, consider implementing table partitioning by date.
4. **Vacuum**: Regular VACUUM and ANALYZE operations should be scheduled to maintain performance.

## Security Considerations

1. **Row-Level Security**: All tables have RLS policies to restrict access based on user roles.
2. **Encryption**: Sensitive data in JSONB columns should be encrypted before storage.
3. **Audit Logging**: All sensitive operations are logged in the `audit_logs` table.
4. **Minimal Permissions**: Database users should have minimal necessary permissions.

## Backup and Recovery

1. **Regular Backups**: Full database backups should be performed daily.
2. **Point-in-Time Recovery**: WAL archiving should be enabled for point-in-time recovery.
3. **Retention Policy**: Backups should be retained for at least 30 days.
