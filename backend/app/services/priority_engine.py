import math
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.domain_models import Demographics, InfrastructureIndex, GovernmentProject
from app.models.recommendation_models import (
    AIPriorityRecommendation,
    ScoreFactorBreakdown,
    SuggestedIntervention,
    HotspotPoint
)

SCHEME_REGISTRY = {
    "Transportation": {
        "scheme": "Pradhan Mantri Gram Sadak Yojana (PMGSY) / BRICS Sustainable Roadways",
        "title_template": "All-Weather Rural Road & Bridge Connectivity Upgrade",
        "cost_base_inr_cr": 16.5,
        "cost_base_usd_m": 1.98,
        "timeline_months": 12,
        "sdgs": ["SDG 9: Industry, Innovation & Infrastructure", "SDG 11: Sustainable Cities & Communities", "SDG 4: Quality Education Access"],
        "agency": "State Rural Roads Development Agency (SRRDA) & Ministry of Rural Development",
        "deliverables": [
            "18.4 km all-weather blacktopped single-lane road construction",
            "Reinforced concrete box-culvert for monsoon flood runoff",
            "Solar streetlights and road safety reflective signage near school zones"
        ]
    },
    "Water & Sanitation": {
        "scheme": "Jal Jeevan Mission (JJM) / BRICS Clean Water Initiative",
        "title_template": "Piped Safe Drinking Water Network & Filtration Augmentation",
        "cost_base_inr_cr": 12.8,
        "cost_base_usd_m": 1.54,
        "timeline_months": 8,
        "sdgs": ["SDG 6: Clean Water & Sanitation", "SDG 3: Good Health & Well-being"],
        "agency": "Rural Water Supply and Sanitation (RWSS) & Jal Shakti Department",
        "deliverables": [
            "Central reverse osmosis and fluoride filtration plant (10,000 LPH)",
            "Underground HDPE pipeline extension to 1,450 rural households",
            "Automated water quality sensor node with IoT telemetry"
        ]
    },
    "Healthcare": {
        "scheme": "National Health Mission (NHM) / Ayushman Bharat Infrastructure",
        "title_template": "Primary Health Sub-Center 24/7 Power & Emergency Care Modernization",
        "cost_base_inr_cr": 8.4,
        "cost_base_usd_m": 1.01,
        "timeline_months": 6,
        "sdgs": ["SDG 3: Good Health & Well-being", "SDG 10: Reduced Inequalities"],
        "agency": "District Health Society & Directorate of Public Health",
        "deliverables": [
            "20 kW Rooftop Solar Hybrid micro-grid with 4-hour battery reserve",
            "Dedicated 108 Advanced Life Support (ALS) ambulance stationing",
            "Neonatal warmer, oxygen concentrators, and telemedicine diagnostic link"
        ]
    },
    "Education": {
        "scheme": "Samagra Shiksha Abhiyan / BRICS Digital Literacy Infrastructure",
        "title_template": "Rural School Campus Modernization, Sanitation & Electrification",
        "cost_base_inr_cr": 6.2,
        "cost_base_usd_m": 0.74,
        "timeline_months": 6,
        "sdgs": ["SDG 4: Quality Education", "SDG 6: Clean Water & Sanitation"],
        "agency": "Department of School Education",
        "deliverables": [
            "Campus floodproofing drainage and boundary wall reinforcement",
            "Dedicated girl & boy sanitation blocks with continuous piped water",
            "Uninterrupted solar power supply for smart lab and lighting"
        ]
    },
    "Waste Management": {
        "scheme": "Swachh Bharat Mission (Grameen & Urban) / Eco-Drainage Mission",
        "title_template": "Stormwater Drainage De-clogging & Community Solid Waste Processing",
        "cost_base_inr_cr": 9.0,
        "cost_base_usd_m": 1.08,
        "timeline_months": 9,
        "sdgs": ["SDG 11: Sustainable Cities & Communities", "SDG 12: Responsible Consumption"],
        "agency": "Municipal Administration & Gram Panchayat Sanitation Wing",
        "deliverables": [
            "6.2 km underground reinforced concrete stormwater trunk line",
            "Automated trash screen bar racks to prevent urban channel choking",
            "Decentralized composting yard and mechanized collection vehicles"
        ]
    },
    "Power & Energy": {
        "scheme": "RDSS (Revamped Distribution Sector Scheme) / BRICS Green Power",
        "title_template": "24/7 Rural Feeder Segregation & Substation Modernization",
        "cost_base_inr_cr": 14.5,
        "cost_base_usd_m": 1.74,
        "timeline_months": 10,
        "sdgs": ["SDG 7: Affordable & Clean Energy", "SDG 13: Climate Action"],
        "agency": "State Power Distribution Corporation (DISCOM)",
        "deliverables": [
            "33/11 kV Substation augmentation with automated capacitor banks",
            "Dedicated agricultural feeder separation for stable supply",
            "High-tension aerial bunched cable installation"
        ]
    }
}

class PriorityEngineService:
    @staticmethod
    def get_category_infra_score(infra: Dict[str, Any], category: str) -> float:
        cat_lower = category.lower()
        if "transport" in cat_lower or "road" in cat_lower:
            return float(infra.get("road_index", 50.0))
        elif "water" in cat_lower or "sanitation" in cat_lower:
            return float(infra.get("water_index", 50.0))
        elif "health" in cat_lower:
            return float(infra.get("healthcare_index", 50.0))
        elif "edu" in cat_lower:
            return float(infra.get("education_index", 50.0))
        elif "waste" in cat_lower:
            return float(infra.get("waste_management_index", 50.0))
        elif "power" in cat_lower or "energy" in cat_lower:
            return float(infra.get("power_grid_index", 50.0))
        return 50.0

    @classmethod
    def calculate_priority(
        cls,
        district: str,
        state: str,
        country: str,
        category: str,
        requests_in_cluster: List[Dict[str, Any]],
        demographics: Optional[Dict[str, Any]],
        infrastructure: Optional[Dict[str, Any]],
        matching_projects: List[Dict[str, Any]]
    ) -> AIPriorityRecommendation:
        
        req_count = len(requests_in_cluster)
        
        # 1. Citizen Demand Score (0-100)
        # Scaled non-linearly: 35+ requests = 95+ score
        demand_score = min(100.0, max(20.0, req_count * 2.8 + 15.0))

        # 2. Infrastructure Deficit Score (100 - Index)
        infra_score = cls.get_category_infra_score(infrastructure or {}, category)
        infra_deficit_score = max(0.0, min(100.0, 100.0 - infra_score))

        # 3. Population Impact Score (0-100)
        pop = demographics.get("population", 500000) if demographics else 500000
        vulnerable_pct = demographics.get("vulnerable_population_pct", 30.0) if demographics else 30.0
        rural_pct = demographics.get("rural_population_pct", 65.0) if demographics else 65.0
        
        # Estimate affected population based on category and request intensity
        affected_fraction = 0.025 + (req_count / 150.0) * 0.06
        if category == "Transportation":
            affected_fraction *= 1.4
        elif category == "Water & Sanitation":
            affected_fraction *= 1.3
        
        estimated_affected_population = int(min(pop * 0.45, max(1200, pop * affected_fraction)))
        pop_impact_score = min(100.0, max(30.0, math.log10(max(1000, estimated_affected_population)) * 22.0))

        # 4. Severity / Urgency Score (0-100)
        if requests_in_cluster:
            avg_sev = sum(r.get("severity", 7) for r in requests_in_cluster) / len(requests_in_cluster)
        else:
            avg_sev = 7.5
        severity_score = min(100.0, avg_sev * 10.0)

        # 5. Project Deficit Score (0-100)
        # If no active project exists for this category in district, score is 95 (urgent deficit)
        active_matching = [p for p in matching_projects if p.get("category", "").lower() in category.lower() or category.lower() in p.get("category", "").lower()]
        if not active_matching:
            project_deficit_score = 95.0
            existing_count = 0
        else:
            existing_count = len(active_matching)
            avg_comp = sum(p.get("completion_percentage", 0) for p in active_matching) / existing_count
            project_deficit_score = max(15.0, 85.0 - (avg_comp * 0.7))

        # Composite Formula Calculation
        w_demand = 0.30
        w_infra = 0.25
        w_pop = 0.20
        w_sev = 0.15
        w_proj = 0.10

        composite_score = round(
            (demand_score * w_demand) +
            (infra_deficit_score * w_infra) +
            (pop_impact_score * w_pop) +
            (severity_score * w_sev) +
            (project_deficit_score * w_proj)
        )
        composite_score = max(10, min(99, composite_score))

        # Priority Level
        if composite_score >= 85:
            priority_level = "CRITICAL"
        elif composite_score >= 75:
            priority_level = "HIGH"
        elif composite_score >= 60:
            priority_level = "MEDIUM"
        else:
            priority_level = "LOW"

        # Construct Factor Breakdown
        factor_breakdown = ScoreFactorBreakdown(
            citizen_demand_score=round(demand_score, 1),
            citizen_demand_weight=w_demand,
            infrastructure_gap_score=round(infra_deficit_score, 1),
            infrastructure_gap_weight=w_infra,
            population_impact_score=round(pop_impact_score, 1),
            population_impact_weight=w_pop,
            severity_urgency_score=round(severity_score, 1),
            severity_urgency_weight=w_sev,
            project_deficit_score=round(project_deficit_score, 1),
            project_deficit_weight=w_proj
        )

        # AI Plain-Language Reasoning Generation
        reasoning_parts = []
        reasoning_parts.append(
            f"Citizen demand is acutely concentrated in {district} with {req_count} verified citizen submissions "
            f"identifying severe {category.lower()} bottlenecks."
        )
        if infra_score < 40:
            reasoning_parts.append(
                f"This coincides with an acute infrastructure deficit ({category} index is critically low at {infra_score:.0f}/100, placing it in the bottom quartile)."
            )
        else:
            reasoning_parts.append(
                f"The current {category} infrastructure index ({infra_score:.0f}/100) is insufficient to support the growing regional load."
            )
        
        reasoning_parts.append(
            f"An estimated {estimated_affected_population:,} citizens face continuous disruption."
        )

        if existing_count == 0:
            reasoning_parts.append(
                "Crucially, zero matching government public works projects are currently active in this corridor, creating an unaddressed public service gap."
            )
        else:
            reasoning_parts.append(
                f"Existing public works ({existing_count} project recorded) do not adequately cover the specific bottleneck identified by citizen submissions."
            )

        ai_reasoning = " ".join(reasoning_parts)

        # Intervention Spec
        scheme_info = SCHEME_REGISTRY.get(category, SCHEME_REGISTRY["Transportation"])
        suggested_intervention = SuggestedIntervention(
            scheme_name=scheme_info["scheme"],
            project_title=f"{district} {scheme_info['title_template']}",
            estimated_cost_inr_cr=scheme_info["cost_base_inr_cr"],
            estimated_cost_usd_m=scheme_info["cost_base_usd_m"],
            estimated_timeline_months=scheme_info["timeline_months"],
            sdg_alignment=scheme_info["sdgs"],
            implementation_agency=scheme_info["agency"],
            key_deliverables=scheme_info["deliverables"]
        )

        # Sample Citizen Quotes
        sample_quotes = []
        for req in requests_in_cluster[:3]:
            sample_quotes.append({
                "request_id": req.get("request_id"),
                "raw_text": req.get("raw_text"),
                "translated_text": req.get("translated_text"),
                "language": req.get("language"),
                "is_voice": req.get("is_voice", False),
                "severity": req.get("severity", 8),
                "locality": req.get("locality", district)
            })

        rec_id = f"REC-{state[:2].upper()}-{category[:3].upper()}-{district[:3].upper()}"

        return AIPriorityRecommendation(
            recommendation_id=rec_id,
            title=f"{district} {category} Priority Intervention",
            country=country,
            state=state,
            district=district,
            region_id=demographics.get("region_id", f"{country[:3]}-{state[:2]}-{district[:3]}").upper() if demographics else f"REG-{district[:3].upper()}",
            category=category,
            subcategory=requests_in_cluster[0].get("subcategory", "General Infrastructure") if requests_in_cluster else "General Infrastructure",
            priority_level=priority_level,
            priority_score=composite_score,
            citizen_requests_count=req_count,
            affected_population_estimate=estimated_affected_population,
            infrastructure_index_score=infra_score,
            infrastructure_category_name=f"{category} Index",
            existing_matching_projects_count=existing_count,
            ai_reasoning=ai_reasoning,
            factor_breakdown=factor_breakdown,
            suggested_intervention=suggested_intervention,
            sample_citizen_quotes=sample_quotes,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status="Pending Review"
        )
