from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.data_store import DATA_STORE
from app.services.ai_pipeline import AIPipelineService

router = APIRouter(prefix="/api/scenarios", tags=["Hackathon Demo Scenarios"])

PRESET_SCENARIOS = [
    {
        "scenario_id": "SCEN-TELUGU-ROAD",
        "title": "Scenario 1: Monsoon Road Washout (Telugu Voice)",
        "language": "Telugu",
        "language_native": "తెలుగు",
        "state": "Telangana",
        "district": "Warangal",
        "category": "Transportation",
        "input_type": "Voice Audio",
        "text": "మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.",
        "description": "Rural road erosion in Warangal district causing school children cutoff and ambulance blockage during rainy season."
    },
    {
        "scenario_id": "SCEN-HINDI-WATER",
        "title": "Scenario 2: Acute Water Contamination & PHC Outbreak (Hindi Voice)",
        "language": "Hindi",
        "language_native": "हिन्दी",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "category": "Water & Sanitation",
        "input_type": "Voice Audio",
        "text": "हमारे इलाके में पिछले 3 हफ्तों से पीने का साफ पानी नहीं आ रहा है, अस्पताल में मरीज बढ़ रहे हैं।",
        "description": "Vidarbha rural water contamination causing sudden surge in hospital cases."
    },
    {
        "scenario_id": "SCEN-ENG-HEALTH",
        "title": "Scenario 3: Primary Health Emergency Power Deficit (English)",
        "language": "English",
        "language_native": "English",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "category": "Healthcare",
        "input_type": "Text Request",
        "text": "The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators and baby warmers stop working.",
        "description": "Hospital power outage in Kalyanadurg endangering newborn and critical patients."
    },
    {
        "scenario_id": "SCEN-BRAZIL-BRIDGE",
        "title": "Scenario 4: BRICS Cross-Border - Rural Bridge Collapse (Brazil Portuguese)",
        "language": "Portuguese",
        "language_native": "Português",
        "country": "Brazil",
        "state": "Minas Gerais",
        "district": "Jequitinhonha",
        "category": "Transportation",
        "input_type": "Voice Audio",
        "text": "A ponte de madeira que liga nossa comunidade rural à cidade principal está desabando. O ônibus escolar não consegue mais passar.",
        "description": "Demonstrating BRICS Digital Public Good scaling with rural bridge collapse in Brazil."
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def get_preset_scenarios():
    return PRESET_SCENARIOS

@router.post("/inject/{scenario_id}")
def inject_scenario(scenario_id: str):
    matched = next((s for s in PRESET_SCENARIOS if s["scenario_id"] == scenario_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Extract structured AI info
    extraction = AIPipelineService.extract_structured_data(
        text=matched["text"],
        location_hint=matched["district"],
        language_override=matched["language"]
    )

    record_dict = {
        "raw_text": matched["text"],
        "translated_text": extraction.translated_text,
        "language": matched["language"],
        "country": matched.get("country", "India"),
        "state": matched["state"],
        "district": matched["district"],
        "locality": f"{matched['district']} Center",
        "is_voice": "Voice" in matched["input_type"],
        "voice_duration_sec": 14.2 if "Voice" in matched["input_type"] else None,
        "category": extraction.category,
        "subcategory": extraction.subcategory,
        "severity": extraction.severity,
        "urgency": extraction.urgency,
        "affected_group": extraction.affected_group
    }

    saved = DATA_STORE.add_request(record_dict)

    return {
        "status": "success",
        "scenario": matched,
        "created_request": saved,
        "extraction": extraction.model_dump(),
        "message": f"Injected '{matched['title']}'! Policymaker dashboard and demand hotspot map updated."
    }
