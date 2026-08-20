export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type MainTab = 'home' | 'citizen' | 'authority';

export type AuthoritySubTab =
  | 'overview'
  | 'needs'
  | 'map'
  | 'infrastructure'
  | 'recommendations'
  | 'projects'
  | 'insights'
  | 'explorer';

export type TimePeriodFilter = 'all' | 'last_30_days' | 'last_90_days' | 'last_year';

export interface ScoreFactorBreakdown {
  citizen_demand_score: number;
  citizen_demand_weight: number;
  infrastructure_gap_score: number;
  infrastructure_gap_weight: number;
  population_impact_score: number;
  population_impact_weight: number;
  severity_urgency_score: number;
  severity_urgency_weight: number;
  project_deficit_score: number;
  project_deficit_weight: number;
}

export interface SuggestedIntervention {
  scheme_name: string;
  project_title: string;
  estimated_cost_inr_cr: number;
  estimated_cost_usd_m: number;
  estimated_timeline_months: number;
  sdg_alignment: string[];
  implementation_agency: string;
  key_deliverables: string[];
}

export interface CitizenQuote {
  request_id: string;
  raw_text: string;
  translated_text: string;
  language: string;
  is_voice: boolean;
  severity: number;
  locality: string;
}

export interface AIPriorityRecommendation {
  recommendation_id: string;
  title: string;
  country: string;
  state: string;
  district: string;
  region_id: string;
  category: string;
  subcategory: string;
  priority_level: PriorityLevel;
  priority_score: number;
  citizen_requests_count: number;
  affected_population_estimate: number;
  infrastructure_index_score: number;
  infrastructure_category_name: string;
  existing_matching_projects_count: number;
  ai_reasoning: string;
  factor_breakdown: ScoreFactorBreakdown;
  suggested_intervention: SuggestedIntervention;
  sample_citizen_quotes: CitizenQuote[];
  created_at: string;
  status: string;
}

export interface SemanticClusterSample {
  original_quote: string;
  translated_quote: string;
  language: string;
  locality: string;
  semantic_match_reason: string;
}

export interface CommunityNeed {
  need_id: string;
  title: string;
  category: string;
  district: string;
  state: string;
  country: string;
  citizen_requests_count: number;
  affected_population_estimate: number;
  demand_trend: string;
  infrastructure_condition: string;
  infrastructure_index_score: number;
  priority_score: number;
  priority_level: PriorityLevel;
  key_issues: string[];
  semantic_cluster_samples?: SemanticClusterSample[];
  last_updated: string;
  active_projects_count: number;
}

export interface AnalyticalInsight {
  insight_id: string;
  insight_type: 'Emerging Need' | 'Infrastructure Gap' | 'Coverage Gap' | 'Emerging Trend';
  title: string;
  region: string;
  country: string;
  category: string;
  description: string;
  metrics_summary: string;
  suggested_attention: string;
  priority_level: string;
}

export interface HotspotPoint {
  region_id: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  request_count: number;
  top_category: string;
  avg_severity: number;
  infrastructure_deficit_index: number;
  composite_priority_score: number;
  priority_level: PriorityLevel;
  affected_population: number;
  active_projects_count: number;
  summary: string;
}

export interface ExecutiveStats {
  total_requests: number;
  voice_requests_count: number;
  text_requests_count: number;
  high_priority_needs_count: number;
  critical_infra_gaps_count: number;
  areas_under_review_count: number;
  recommended_projects_count: number;
  languages_supported_count: number;
  category_distribution: Record<string, number>;
  language_distribution: Record<string, number>;
  severity_distribution: Record<string, number>;
  urgency_distribution: Record<string, number>;
  trend_over_time: Array<{
    period: string;
    requests: number;
    resolved: number;
  }>;
}

export interface CitizenRequestRecord {
  request_id: string;
  created_at: string;
  raw_text: string;
  translated_text: string;
  language: string;
  country: string;
  state: string;
  district: string;
  locality?: string;
  latitude: number;
  longitude: number;
  is_voice: boolean;
  voice_duration_sec?: number;
  category: string;
  subcategory: string;
  severity: number;
  urgency: string;
  affected_group: string;
  status: string;
}

export interface AIStructuredExtraction {
  category: string;
  subcategory: string;
  location: string;
  severity: number;
  urgency: string;
  affected_group: string;
  language: string;
  translated_text: string;
  key_entities: string[];
  sentiment: string;
  sentiment_score: number;
}

export interface Demographics {
  country: string;
  state: string;
  district: string;
  region_id: string;
  population: number;
  households: number;
  schools_count: number;
  hospitals_count: number;
  rural_population_pct: number;
  vulnerable_population_pct: number;
  population_density_per_sqkm: number;
  latitude: number;
  longitude: number;
}

export interface InfrastructureIndex {
  country: string;
  state: string;
  district: string;
  region_id: string;
  road_index: number;
  water_index: number;
  healthcare_index: number;
  education_index: number;
  waste_management_index: number;
  electricity_index: number;
  public_transport_index: number;
  last_survey_year: number;
}

export interface GovernmentProject {
  project_id: string;
  country: string;
  state: string;
  district: string;
  region_id: string;
  title: string;
  category: string;
  subcategory: string;
  budget_allocated_inr_cr: number;
  budget_allocated_usd_m: number;
  status: string;
  completion_percentage: number;
  implementing_agency: string;
  target_completion_date: string;
  target_population: number;
  related_community_needs: string[];
}
