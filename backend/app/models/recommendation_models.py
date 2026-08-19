from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ScoreFactorBreakdown(BaseModel):
    citizen_demand_score: float = Field(..., description="0-100 normalized score of citizen requests density")
    citizen_demand_weight: float = 0.30
    
    infrastructure_gap_score: float = Field(..., description="0-100 deficit score (100 - Infra Index)")
    infrastructure_gap_weight: float = 0.25
    
    population_impact_score: float = Field(..., description="0-100 normalized affected population scale")
    population_impact_weight: float = 0.20
    
    severity_urgency_score: float = Field(..., description="0-100 score based on extracted severity & urgency")
    severity_urgency_weight: float = 0.15
    
    project_deficit_score: float = Field(..., description="0-100 score reflecting absence of active matching govt works")
    project_deficit_weight: float = 0.10

class SuggestedIntervention(BaseModel):
    scheme_name: str
    project_title: str
    estimated_cost_inr_cr: float
    estimated_cost_usd_m: float
    estimated_timeline_months: int
    sdg_alignment: List[str]
    implementation_agency: str
    key_deliverables: List[str]

class AIPriorityRecommendation(BaseModel):
    recommendation_id: str
    title: str
    country: str
    state: str
    district: str
    region_id: str
    category: str
    subcategory: str
    priority_level: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    priority_score: int = Field(..., ge=0, le=100)
    
    citizen_requests_count: int
    affected_population_estimate: int
    infrastructure_index_score: float
    infrastructure_category_name: str
    existing_matching_projects_count: int
    
    ai_reasoning: str
    factor_breakdown: ScoreFactorBreakdown
    suggested_intervention: SuggestedIntervention
    
    sample_citizen_quotes: List[Dict[str, Any]] = []
    created_at: str
    status: str = "Under Policy Review" # Under Policy Review, Approved for DPR, Sanctioned, Deferred

class HotspotPoint(BaseModel):
    region_id: str
    district: str
    state: str
    country: str
    latitude: float
    longitude: float
    request_count: int
    top_category: str
    avg_severity: float
    infrastructure_deficit_index: float
    composite_priority_score: int
    priority_level: str
    affected_population: int
    active_projects_count: int
    summary: str

class ExecutiveStats(BaseModel):
    total_requests: int = 24836
    voice_requests_count: int = 8920
    text_requests_count: int = 15916
    high_priority_needs_count: int = 37
    critical_infra_gaps_count: int = 82
    areas_under_review_count: int = 24
    recommended_projects_count: int = 18
    languages_supported_count: int = 5
    category_distribution: Dict[str, int]
    language_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    urgency_distribution: Dict[str, int]
    trend_over_time: List[Dict[str, Any]]
