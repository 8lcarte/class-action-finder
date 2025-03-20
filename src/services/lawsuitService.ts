import { supabase } from '@/lib/supabase';
import type { Lawsuit } from '@/lib/supabase';

export interface SearchParams {
  query?: string;
  location?: string;
  category?: string;
  minCompensation?: number;
  maxCompensation?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  lawsuits: Lawsuit[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function searchLawsuits(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    location,
    category,
    minCompensation,
    maxCompensation,
    deadlineAfter,
    deadlineBefore,
    page = 1,
    limit = 10
  } = params;

  let queryBuilder = supabase
    .from('lawsuits')
    .select('*, defendants(*)', { count: 'exact' });

  // Full-text search on lawsuit name
  if (query) {
    queryBuilder = queryBuilder.textSearch('name', query, {
      type: 'websearch',
      config: 'english'
    });
  }

  // Filter by location if provided
  if (location) {
    queryBuilder = queryBuilder.contains('eligibility_criteria', { residence: [location] });
  }

  // Filter by category if provided
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  // Filter by compensation range
  if (minCompensation !== undefined) {
    queryBuilder = queryBuilder.gte('settlement_info->tier_structure->0->amount', minCompensation);
  }

  if (maxCompensation !== undefined) {
    queryBuilder = queryBuilder.lte('settlement_info->tier_structure->0->amount', maxCompensation);
  }

  // Filter by deadline range
  if (deadlineAfter) {
    queryBuilder = queryBuilder.gte('important_dates->opt_out_deadline', deadlineAfter.toISOString());
  }

  if (deadlineBefore) {
    queryBuilder = queryBuilder.lte('important_dates->opt_out_deadline', deadlineBefore.toISOString());
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  queryBuilder = queryBuilder.range(from, to);

  // Execute the query
  const { data, error, count } = await queryBuilder;

  if (error) {
    console.error('Error searching lawsuits:', error);
    throw error;
  }

  return {
    lawsuits: data as Lawsuit[],
    total: count || 0,
    page,
    limit,
    hasMore: count ? from + data.length < count : false
  };
}

export async function getLawsuitById(id: string): Promise<Lawsuit | null> {
  const { data, error } = await supabase
    .from('lawsuits')
    .select('*, defendants(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lawsuit:', error);
    return null;
  }

  return data as Lawsuit;
}

export async function getSimilarLawsuits(lawsuitId: string, limit = 3): Promise<Lawsuit[]> {
  // First get the current lawsuit to find similar ones
  const { data: lawsuit, error: lawsuitError } = await supabase
    .from('lawsuits')
    .select('name, defendants(company_name)')
    .eq('id', lawsuitId)
    .single();

  if (lawsuitError || !lawsuit) {
    console.error('Error fetching lawsuit for similarity:', lawsuitError);
    return [];
  }

  // Get defendants company names
  const defendants = lawsuit.defendants as { company_name: string }[];
  const companyNames = defendants.map(d => d.company_name);

  // Find lawsuits with similar defendants
  const { data, error } = await supabase
    .from('lawsuits')
    .select('*, defendants(*)')
    .neq('id', lawsuitId) // Exclude the current lawsuit
    .limit(limit);

  if (error) {
    console.error('Error fetching similar lawsuits:', error);
    return [];
  }

  return data as Lawsuit[];
}

export async function saveSearch(userId: string, searchParams: SearchParams): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert([
      {
        user_id: userId,
        search_query: searchParams,
        notification_enabled: false
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error saving search:', error);
    return null;
  }

  return { id: data.id };
}

export async function getSavedSearches(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved searches:', error);
    return [];
  }

  return data;
}

export async function deleteSavedSearch(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting saved search:', error);
    return false;
  }

  return true;
}

export async function updateSavedSearchNotifications(id: string, enabled: boolean, frequency?: string): Promise<boolean> {
  const updateData: any = { notification_enabled: enabled };
  
  if (frequency) {
    updateData.notification_frequency = frequency;
  }
  
  const { error } = await supabase
    .from('saved_searches')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating saved search notifications:', error);
    return false;
  }

  return true;
}
