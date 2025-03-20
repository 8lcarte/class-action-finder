import { supabase } from '@/lib/supabase';
import type { DataSource } from '@/lib/supabase';

export interface ScraperConfig {
  url: string;
  selectors: Record<string, string>;
  throttling: number;
  politenessDelay: number;
}

export interface DataExtractionResult {
  success: boolean;
  data?: any;
  error?: string;
  confidenceScore: number;
}

export async function getDataSources(): Promise<DataSource[]> {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .order('reliability_metrics->accuracy', { ascending: false });

  if (error) {
    console.error('Error fetching data sources:', error);
    return [];
  }

  return data as DataSource[];
}

export async function addDataSource(dataSource: Omit<DataSource, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('data_sources')
    .insert([dataSource])
    .select('id')
    .single();

  if (error) {
    console.error('Error adding data source:', error);
    return null;
  }

  return { id: data.id };
}

export async function updateDataSourceReliability(id: string, metrics: { accuracy: number; completeness: number; timeliness: number }): Promise<boolean> {
  const { error } = await supabase
    .from('data_sources')
    .update({
      reliability_metrics: metrics
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating data source reliability:', error);
    return false;
  }

  return true;
}

export async function updateDataSourceSuccessHistory(id: string, success: boolean): Promise<boolean> {
  // First get the current data source to update success history
  const { data: currentSource, error: fetchError } = await supabase
    .from('data_sources')
    .select('success_history')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching data source for history update:', fetchError);
    return false;
  }

  const successHistory = currentSource.success_history || {
    success_count: 0,
    failure_count: 0,
    last_success: null,
    last_failure: null
  };

  const now = new Date().toISOString();

  if (success) {
    successHistory.success_count += 1;
    successHistory.last_success = now;
  } else {
    successHistory.failure_count += 1;
    successHistory.last_failure = now;
  }

  const { error } = await supabase
    .from('data_sources')
    .update({
      success_history: successHistory
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating data source success history:', error);
    return false;
  }

  return true;
}

export async function extractStructuredData(html: string, config: ScraperConfig): Promise<DataExtractionResult> {
  // This would typically use a more sophisticated extraction algorithm
  // For now, we'll implement a simplified version that simulates extraction
  
  try {
    // Simulate data extraction based on selectors
    const extractedData: Record<string, any> = {};
    let confidenceScore = 0.85; // Base confidence score
    
    // Simulate extraction success with random data
    Object.keys(config.selectors).forEach(key => {
      extractedData[key] = `Extracted ${key} data`;
    });
    
    return {
      success: true,
      data: extractedData,
      confidenceScore
    };
  } catch (error) {
    console.error('Error extracting structured data:', error);
    return {
      success: false,
      error: error.message,
      confidenceScore: 0
    };
  }
}

export async function deduplicateEntities(entities: any[], entityType: 'lawsuit' | 'defendant'): Promise<any[]> {
  // This would typically use more sophisticated entity resolution algorithms
  // For now, we'll implement a simplified version
  
  const uniqueEntities: any[] = [];
  const seenKeys = new Set();
  
  entities.forEach(entity => {
    let key;
    
    if (entityType === 'lawsuit') {
      key = `${entity.case_number}|${entity.court}`;
    } else if (entityType === 'defendant') {
      key = entity.company_name.toLowerCase().trim();
    }
    
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueEntities.push(entity);
    }
  });
  
  return uniqueEntities;
}

export async function extractEligibilityCriteria(legalText: string): Promise<{ criteria: Record<string, any>; confidenceScore: number }> {
  // This would typically use NLP to extract eligibility criteria from legal language
  // For now, we'll implement a simplified version
  
  // Simulate NLP extraction with predefined patterns
  const criteria: Record<string, any> = {
    account_holder: true,
    breach_period: { start: "2022-01-01", end: "2022-12-31" },
    residence: ["US"],
    exclusions: []
  };
  
  // Simulate confidence score
  const confidenceScore = 0.8;
  
  return { criteria, confidenceScore };
}

export async function prioritizeDataSources(): Promise<DataSource[]> {
  // Get all data sources
  const dataSources = await getDataSources();
  
  // Calculate priority score based on reliability metrics and success history
  const sourcesWithPriority = dataSources.map(source => {
    const reliability = source.reliability_metrics;
    const history = source.success_history;
    
    // Calculate success rate
    const totalAttempts = history.success_count + history.failure_count;
    const successRate = totalAttempts > 0 ? history.success_count / totalAttempts : 0.5;
    
    // Calculate priority score (weighted average of metrics)
    const priorityScore = 
      reliability.accuracy * 0.4 + 
      reliability.completeness * 0.3 + 
      reliability.timeliness * 0.2 + 
      successRate * 0.1;
    
    return {
      ...source,
      priorityScore
    };
  });
  
  // Sort by priority score (descending)
  return sourcesWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
}
