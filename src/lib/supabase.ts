import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  name?: string;
  address?: string;
  phone?: string;
  demographics?: Record<string, any>;
  preferences?: Record<string, any>;
  privacy_settings?: Record<string, boolean>;
  account_tier: 'free' | 'premium';
  action_history?: Record<string, any>[];
};

export type Lawsuit = {
  id: string;
  name: string;
  case_number: string;
  court: string;
  judge?: string;
  defendants: Defendant[];
  settlement_info: {
    total_amount?: number;
    tier_structure?: Record<string, any>[];
  };
  eligibility_criteria: Record<string, any>;
  required_evidence: string[];
  important_dates: {
    filing_date: string;
    opt_out_deadline?: string;
    hearing_dates?: string[];
  };
  success_metrics?: {
    average_payout?: number;
    approval_rate?: number;
  };
  source_info: {
    url: string;
    confidence_score: number;
  };
  created_at: string;
  updated_at: string;
};

export type Defendant = {
  id: string;
  lawsuit_id: string;
  company_name: string;
  company_info?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  user_id: string;
  lawsuit_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  status_history: {
    status: string;
    timestamp: string;
  }[];
  documents: {
    id: string;
    type: string;
    url: string;
    verification_status: 'pending' | 'verified' | 'rejected';
  }[];
  communication_history: {
    message: string;
    timestamp: string;
    direction: 'inbound' | 'outbound';
  }[];
  eligibility_answers: Record<string, any>;
  estimated_payout_range?: {
    min: number;
    max: number;
  };
  priority_score?: number;
  resolution_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type DataSource = {
  id: string;
  name: string;
  url: string;
  reliability_metrics: {
    accuracy: number;
    completeness: number;
    timeliness: number;
  };
  scraping_config: {
    selectors: Record<string, string>;
    throttling: number;
    politeness_delay: number;
  };
  data_mapping: Record<string, string>;
  access_credentials?: {
    type: 'api_key' | 'oauth' | 'basic_auth';
    details: Record<string, string>;
  };
  success_history: {
    success_count: number;
    failure_count: number;
    last_success: string;
    last_failure?: string;
  };
  created_at: string;
  updated_at: string;
};
