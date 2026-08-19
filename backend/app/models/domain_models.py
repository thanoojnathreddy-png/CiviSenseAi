from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Demographics(BaseModel):
    country: str = "India"
    state: str
    district: str
    region_id: str
    population: int
    households: int
    schools_count: int
    hospitals_count: int
    rural_population_pct: float
    vulnerable_population_pct: float
    population_density_per_sqkm: int = 420
    latitude: float
    longitude: float

class InfrastructureIndex(BaseModel):
    country: str = "India"
    state: str
    district: str
    region_id: str
    road_index: float = Field(..., description="0-100 score, higher is better")
    water_index: float = Field(..., description="0-100 score, higher is better")
    healthcare_index: float = Field(..., description="0-100 score, higher is better")
    education_index: float = Field(..., description="0-100 score, higher is better")
    waste_management_index: float = Field(..., description="0-100 score, higher is better")
    electricity_index: float = Field(default=68.0, description="0-100 score")
    public_transport_index: float = Field(default=52.0, description="0-100 score")
    last_survey_year: int = 2025

class GovernmentProject(BaseModel):
    project_id: str
    country: str = "India"
    state: str
    district: str
    region_id: str
    title: str
    category: str
    subcategory: str
    budget_allocated_inr_cr: float
    budget_allocated_usd_m: float
    status: str = Field(..., description="Approved, In Progress, Delayed, Completed")
    completion_percentage: float
    implementing_agency: str
    target_completion_date: str
    target_population: int = 25000
    related_community_needs: List[str] = []

class CommunityNeed(BaseModel):
    need_id: str
    title: str
    category: str
    district: str
    state: str
    country: str
    citizen_requests_count: int
    affected_population_estimate: int
    demand_trend: str = Field(..., description="Increasing, Stable, High")
    infrastructure_condition: str = Field(..., description="Low, Medium, High")
    infrastructure_index_score: float
    priority_score: int
    priority_level: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    key_issues: List[str]
    last_updated: str
    active_projects_count: int = 0

class AnalyticalInsight(BaseModel):
    insight_id: str
    insight_type: str = Field(..., description="Emerging Need, Infrastructure Gap, Coverage Gap, Emerging Trend")
    title: str
    region: str
    country: str
    category: str
    description: str
    metrics_summary: str
    suggested_attention: str
    priority_level: str = "HIGH"
