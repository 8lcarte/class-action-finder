-- Create users table with auth integration
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  address TEXT,
  phone TEXT,
  demographics JSONB,
  preferences JSONB,
  privacy_settings JSONB,
  account_tier TEXT NOT NULL DEFAULT 'free' CHECK (account_tier IN ('free', 'premium')),
  action_history JSONB[]
);

-- Create lawsuits table
CREATE TABLE lawsuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  case_number TEXT NOT NULL,
  court TEXT NOT NULL,
  judge TEXT,
  settlement_info JSONB,
  eligibility_criteria JSONB NOT NULL,
  required_evidence TEXT[],
  important_dates JSONB NOT NULL,
  success_metrics JSONB,
  source_info JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create defendants table
CREATE TABLE defendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawsuit_id UUID NOT NULL REFERENCES lawsuits(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawsuit_id UUID NOT NULL REFERENCES lawsuits(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid')),
  status_history JSONB[] NOT NULL DEFAULT '{}',
  documents JSONB[] NOT NULL DEFAULT '{}',
  communication_history JSONB[] NOT NULL DEFAULT '{}',
  eligibility_answers JSONB NOT NULL,
  estimated_payout_range JSONB,
  priority_score FLOAT,
  resolution_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_sources table
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  reliability_metrics JSONB NOT NULL,
  scraping_config JSONB NOT NULL,
  data_mapping JSONB NOT NULL,
  access_credentials JSONB,
  success_history JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query JSONB NOT NULL,
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_notifications table
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('claim_update', 'deadline', 'new_lawsuit', 'system')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_lawsuits_name ON lawsuits USING GIN (to_tsvector('english', name));
CREATE INDEX idx_lawsuits_case_number ON lawsuits(case_number);
CREATE INDEX idx_defendants_company_name ON defendants USING GIN (to_tsvector('english', company_name));
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_lawsuit_id ON claims(lawsuit_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(read);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lawsuits_modtime
BEFORE UPDATE ON lawsuits
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_defendants_modtime
BEFORE UPDATE ON defendants
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_claims_modtime
BEFORE UPDATE ON claims
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_data_sources_modtime
BEFORE UPDATE ON data_sources
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_saved_searches_modtime
BEFORE UPDATE ON saved_searches
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
