import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

export interface OnboardingData {
  name?: string;
  address?: string;
  phone?: string;
  demographics?: {
    age?: number;
    income?: string;
    occupation?: string;
    [key: string]: any;
  };
  preferences?: {
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
    interestCategories?: string[];
    [key: string]: any;
  };
  privacySettings?: {
    shareDataWithPartners?: boolean;
    allowProfileDiscovery?: boolean;
    allowDataAnalytics?: boolean;
    [key: string]: any;
  };
}

export async function updateUserProfile(userId: string, data: OnboardingData): Promise<User | null> {
  const { data: user, error } = await supabase
    .from('users')
    .update({
      name: data.name,
      address: data.address,
      phone: data.phone,
      demographics: data.demographics,
      preferences: data.preferences,
      privacy_settings: data.privacySettings
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return user as User;
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as User;
}

export async function trackUserAction(userId: string, action: string, details: any): Promise<boolean> {
  // First get the current user to update action history
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('action_history')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user for action tracking:', fetchError);
    return false;
  }

  const actionHistory = [
    ...(currentUser.action_history || []),
    {
      action,
      details,
      timestamp: new Date().toISOString()
    }
  ];

  const { error } = await supabase
    .from('users')
    .update({
      action_history: actionHistory
    })
    .eq('id', userId);

  if (error) {
    console.error('Error tracking user action:', error);
    return false;
  }

  return true;
}

export async function generatePersonalizedRecommendations(userId: string): Promise<any[]> {
  // Get user profile and action history
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user for recommendations:', error);
    return [];
  }

  // Get user's demographics and preferences
  const demographics = user.demographics || {};
  const preferences = user.preferences || {};
  const interestCategories = preferences.interestCategories || [];

  // Get user's previous claims
  const { data: userClaims, error: claimsError } = await supabase
    .from('claims')
    .select('lawsuit_id')
    .eq('user_id', userId);

  if (claimsError) {
    console.error('Error fetching user claims for recommendations:', claimsError);
    return [];
  }

  // Get lawsuits that match user's interests and demographics
  let query = supabase
    .from('lawsuits')
    .select('*, defendants(*)');

  // Exclude lawsuits the user has already claimed
  if (userClaims && userClaims.length > 0) {
    const claimedLawsuitIds = userClaims.map(claim => claim.lawsuit_id);
    query = query.not('id', 'in', `(${claimedLawsuitIds.join(',')})`);
  }

  // Filter by user's location if available
  if (demographics.location) {
    query = query.contains('eligibility_criteria', { residence: [demographics.location] });
  }

  // Limit results
  query = query.limit(10);

  const { data: recommendations, error: recommendationsError } = await query;

  if (recommendationsError) {
    console.error('Error fetching recommendations:', recommendationsError);
    return [];
  }

  return recommendations;
}

export async function importUserDataFromService(userId: string, service: string, serviceData: any): Promise<boolean> {
  // Process imported data based on service type
  let processedData: OnboardingData = {};

  switch (service) {
    case 'amazon':
      processedData = {
        name: serviceData.name,
        address: serviceData.address,
        preferences: {
          interestCategories: serviceData.purchaseCategories
        }
      };
      break;
    case 'linkedin':
      processedData = {
        name: serviceData.name,
        demographics: {
          occupation: serviceData.occupation,
          industry: serviceData.industry,
          education: serviceData.education
        }
      };
      break;
    case 'facebook':
      processedData = {
        name: serviceData.name,
        demographics: {
          age: serviceData.age,
          location: serviceData.location
        },
        preferences: {
          interestCategories: serviceData.interests
        }
      };
      break;
    default:
      console.error('Unsupported service for data import:', service);
      return false;
  }

  // Update user profile with imported data
  const result = await updateUserProfile(userId, processedData);
  return result !== null;
}

export async function getSocialProofMetrics(lawsuitId: string): Promise<any> {
  // Get total claims for this lawsuit
  const { count: totalClaims, error: claimsError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('lawsuit_id', lawsuitId);

  if (claimsError) {
    console.error('Error fetching claims count for social proof:', claimsError);
    return { totalClaims: 0 };
  }

  // Get approved claims count
  const { count: approvedClaims, error: approvedError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('lawsuit_id', lawsuitId)
    .eq('status', 'approved');

  if (approvedError) {
    console.error('Error fetching approved claims for social proof:', approvedError);
    return { totalClaims: totalClaims || 0, approvedClaims: 0 };
  }

  // Get average payout if available
  const { data: lawsuit, error: lawsuitError } = await supabase
    .from('lawsuits')
    .select('success_metrics')
    .eq('id', lawsuitId)
    .single();

  if (lawsuitError) {
    console.error('Error fetching lawsuit for social proof:', lawsuitError);
    return { 
      totalClaims: totalClaims || 0, 
      approvedClaims: approvedClaims || 0 
    };
  }

  const averagePayout = lawsuit.success_metrics?.average_payout || null;

  return {
    totalClaims: totalClaims || 0,
    approvedClaims: approvedClaims || 0,
    averagePayout
  };
}
