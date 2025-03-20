import { supabase } from '@/lib/supabase';

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
}

export interface UserAcquisitionMetrics {
  totalUsers: number;
  newUsers: number;
  conversionRate: number;
  acquisitionBySource: Record<string, number>;
  retentionRate: number;
}

export interface EngagementMetrics {
  activeUsers: number;
  averageSessionDuration: number;
  pageViewsPerSession: number;
  bounceRate: number;
  mostViewedPages: Array<{ page: string; views: number }>;
}

export interface ClaimMetrics {
  totalClaims: number;
  newClaims: number;
  conversionRate: number;
  statusDistribution: Record<string, number>;
  averageCompletionTime: number;
  abandonmentRate: number;
  bottlenecks: Array<{ step: string; dropoffRate: number }>;
}

export interface LawsuitMetrics {
  totalLawsuits: number;
  newLawsuits: number;
  mostPopularLawsuits: Array<{ id: string; name: string; views: number; claims: number }>;
  categoryDistribution: Record<string, number>;
  averagePayoutByCategory: Record<string, number>;
}

export interface ROIMetrics {
  totalEstimatedPayout: number;
  averagePayoutPerUser: number;
  timeInvestment: {
    averageMinutesPerClaim: number;
    totalUserMinutes: number;
  };
  valuePerMinute: number;
}

export async function getUserAcquisitionMetrics(timeframe: AnalyticsTimeframe): Promise<UserAcquisitionMetrics> {
  // Get total users
  const { count: totalUsers, error: totalError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total users:', totalError);
    return {
      totalUsers: 0,
      newUsers: 0,
      conversionRate: 0,
      acquisitionBySource: {},
      retentionRate: 0
    };
  }

  // Get new users in timeframe
  const { count: newUsers, error: newError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', timeframe.start.toISOString())
    .lte('created_at', timeframe.end.toISOString());

  if (newError) {
    console.error('Error fetching new users:', newError);
    return {
      totalUsers: totalUsers || 0,
      newUsers: 0,
      conversionRate: 0,
      acquisitionBySource: {},
      retentionRate: 0
    };
  }

  // For a real implementation, we would track acquisition sources and calculate retention
  // Here we'll return simulated data
  return {
    totalUsers: totalUsers || 0,
    newUsers: newUsers || 0,
    conversionRate: totalUsers ? (newUsers / totalUsers) : 0,
    acquisitionBySource: {
      'organic_search': 45,
      'direct': 30,
      'referral': 15,
      'social': 10
    },
    retentionRate: 0.68
  };
}

export async function getEngagementMetrics(timeframe: AnalyticsTimeframe): Promise<EngagementMetrics> {
  // In a real implementation, this would query user session data
  // Here we'll return simulated data
  return {
    activeUsers: 1250,
    averageSessionDuration: 420, // seconds
    pageViewsPerSession: 4.8,
    bounceRate: 0.32,
    mostViewedPages: [
      { page: '/lawsuits', views: 3200 },
      { page: '/dashboard', views: 2800 },
      { page: '/claims', views: 2100 },
      { page: '/profile', views: 1500 },
      { page: '/faq', views: 950 }
    ]
  };
}

export async function getClaimMetrics(timeframe: AnalyticsTimeframe): Promise<ClaimMetrics> {
  // Get total claims
  const { count: totalClaims, error: totalError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total claims:', totalError);
    return {
      totalClaims: 0,
      newClaims: 0,
      conversionRate: 0,
      statusDistribution: {},
      averageCompletionTime: 0,
      abandonmentRate: 0,
      bottlenecks: []
    };
  }

  // Get new claims in timeframe
  const { count: newClaims, error: newError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', timeframe.start.toISOString())
    .lte('created_at', timeframe.end.toISOString());

  if (newError) {
    console.error('Error fetching new claims:', newError);
    return {
      totalClaims: totalClaims || 0,
      newClaims: 0,
      conversionRate: 0,
      statusDistribution: {},
      averageCompletionTime: 0,
      abandonmentRate: 0,
      bottlenecks: []
    };
  }

  // Get status distribution
  const { data: statusData, error: statusError } = await supabase
    .from('claims')
    .select('status');

  let statusDistribution: Record<string, number> = {};
  
  if (!statusError && statusData) {
    statusData.forEach(claim => {
      statusDistribution[claim.status] = (statusDistribution[claim.status] || 0) + 1;
    });
  }

  // For a real implementation, we would calculate actual completion times and identify bottlenecks
  // Here we'll return partially real and partially simulated data
  return {
    totalClaims: totalClaims || 0,
    newClaims: newClaims || 0,
    conversionRate: 0.35, // Simulated
    statusDistribution,
    averageCompletionTime: 14.5, // days, simulated
    abandonmentRate: 0.28, // Simulated
    bottlenecks: [
      { step: 'document_upload', dropoffRate: 0.22 },
      { step: 'eligibility_questions', dropoffRate: 0.15 },
      { step: 'verification', dropoffRate: 0.08 }
    ]
  };
}

export async function getLawsuitMetrics(timeframe: AnalyticsTimeframe): Promise<LawsuitMetrics> {
  // Get total lawsuits
  const { count: totalLawsuits, error: totalError } = await supabase
    .from('lawsuits')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total lawsuits:', totalError);
    return {
      totalLawsuits: 0,
      newLawsuits: 0,
      mostPopularLawsuits: [],
      categoryDistribution: {},
      averagePayoutByCategory: {}
    };
  }

  // Get new lawsuits in timeframe
  const { count: newLawsuits, error: newError } = await supabase
    .from('lawsuits')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', timeframe.start.toISOString())
    .lte('created_at', timeframe.end.toISOString());

  if (newError) {
    console.error('Error fetching new lawsuits:', newError);
    return {
      totalLawsuits: totalLawsuits || 0,
      newLawsuits: 0,
      mostPopularLawsuits: [],
      categoryDistribution: {},
      averagePayoutByCategory: {}
    };
  }

  // Get most popular lawsuits (in a real implementation, this would be based on views and claims)
  const { data: lawsuits, error: lawsuitsError } = await supabase
    .from('lawsuits')
    .select('id, name')
    .limit(5);

  let mostPopularLawsuits: Array<{ id: string; name: string; views: number; claims: number }> = [];
  
  if (!lawsuitsError && lawsuits) {
    // Simulate view and claim counts
    mostPopularLawsuits = lawsuits.map((lawsuit, index) => ({
      id: lawsuit.id,
      name: lawsuit.name,
      views: 1000 - (index * 150),
      claims: 200 - (index * 30)
    }));
  }

  // For a real implementation, we would track categories and calculate actual payouts
  // Here we'll return partially real and partially simulated data
  return {
    totalLawsuits: totalLawsuits || 0,
    newLawsuits: newLawsuits || 0,
    mostPopularLawsuits,
    categoryDistribution: {
      'data_breach': 35,
      'consumer_products': 25,
      'employment': 20,
      'financial': 15,
      'other': 5
    },
    averagePayoutByCategory: {
      'data_breach': 750,
      'consumer_products': 1200,
      'employment': 3500,
      'financial': 2800,
      'other': 950
    }
  };
}

export async function getROIMetrics(timeframe: AnalyticsTimeframe): Promise<ROIMetrics> {
  // In a real implementation, this would calculate actual payouts and time investments
  // Here we'll return simulated data
  return {
    totalEstimatedPayout: 4500000,
    averagePayoutPerUser: 1250,
    timeInvestment: {
      averageMinutesPerClaim: 45,
      totalUserMinutes: 225000
    },
    valuePerMinute: 20 // dollars per minute of user time
  };
}

export async function runABTest(testId: string, variant: 'A' | 'B', metrics: Record<string, number>): Promise<boolean> {
  // In a real implementation, this would store A/B test results in a database
  // Here we'll simulate success
  console.log(`Recording A/B test results for test ${testId}, variant ${variant}:`, metrics);
  return true;
}

export async function getCohortAnalysis(cohortType: 'signup_date' | 'location' | 'age_group', timeframe: AnalyticsTimeframe): Promise<any[]> {
  // In a real implementation, this would perform cohort analysis on user data
  // Here we'll return simulated data
  
  if (cohortType === 'signup_date') {
    return [
      { cohort: 'Jan 2024', users: 1200, retention_30d: 0.65, claims_per_user: 1.8, avg_payout: 950 },
      { cohort: 'Feb 2024', users: 1500, retention_30d: 0.68, claims_per_user: 1.7, avg_payout: 920 },
      { cohort: 'Mar 2024', users: 1800, retention_30d: 0.72, claims_per_user: 1.5, avg_payout: 880 }
    ];
  } else if (cohortType === 'location') {
    return [
      { cohort: 'California', users: 2500, retention_30d: 0.70, claims_per_user: 2.1, avg_payout: 1050 },
      { cohort: 'New York', users: 1800, retention_30d: 0.65, claims_per_user: 1.9, avg_payout: 980 },
      { cohort: 'Texas', users: 1500, retention_30d: 0.62, claims_per_user: 1.7, avg_payout: 920 }
    ];
  } else {
    return [
      { cohort: '18-24', users: 950, retention_30d: 0.58, claims_per_user: 1.2, avg_payout: 780 },
      { cohort: '25-34', users: 2200, retention_30d: 0.72, claims_per_user: 1.8, avg_payout: 950 },
      { cohort: '35-44', users: 1800, retention_30d: 0.75, claims_per_user: 2.1, avg_payout: 1100 }
    ];
  }
}

export async function getPredictiveTrends(): Promise<any[]> {
  // In a real implementation, this would use ML models to predict trends
  // Here we'll return simulated data
  return [
    { category: 'data_breach', trend: 'increasing', confidence: 0.85, forecast_next_quarter: 28 },
    { category: 'consumer_products', trend: 'stable', confidence: 0.72, forecast_next_quarter: 22 },
    { category: 'employment', trend: 'decreasing', confidence: 0.68, forecast_next_quarter: 15 }
  ];
}
