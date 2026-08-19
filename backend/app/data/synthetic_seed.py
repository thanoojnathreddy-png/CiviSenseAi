import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Demographic Benchmarks
INITIAL_DEMOGRAPHICS: List[Dict[str, Any]] = [
    # India - Telangana
    {
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "region_id": "IND-TG-WAR",
        "population": 759000,
        "households": 182000,
        "schools_count": 420,
        "hospitals_count": 34,
        "rural_population_pct": 68.5,
        "vulnerable_population_pct": 31.2,
        "population_density_per_sqkm": 445,
        "latitude": 17.9784,
        "longitude": 79.5941
    },
    {
        "country": "India",
        "state": "Telangana",
        "district": "Adilabad",
        "region_id": "IND-TG-ADI",
        "population": 482000,
        "households": 115000,
        "schools_count": 310,
        "hospitals_count": 18,
        "rural_population_pct": 82.0,
        "vulnerable_population_pct": 44.5,
        "population_density_per_sqkm": 210,
        "latitude": 19.6641,
        "longitude": 78.5320
    },
    # India - Andhra Pradesh
    {
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "region_id": "IND-AP-ANA",
        "population": 840000,
        "households": 205000,
        "schools_count": 510,
        "hospitals_count": 28,
        "rural_population_pct": 74.0,
        "vulnerable_population_pct": 36.8,
        "population_density_per_sqkm": 390,
        "latitude": 14.6819,
        "longitude": 77.6006
    },
    {
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "region_id": "IND-AP-KUR",
        "population": 790000,
        "households": 191000,
        "schools_count": 460,
        "hospitals_count": 25,
        "rural_population_pct": 71.5,
        "vulnerable_population_pct": 33.0,
        "population_density_per_sqkm": 415,
        "latitude": 15.8281,
        "longitude": 78.0373
    },
    # India - Maharashtra
    {
        "country": "India",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "region_id": "IND-MH-YAV",
        "population": 690000,
        "households": 165000,
        "schools_count": 380,
        "hospitals_count": 22,
        "rural_population_pct": 79.0,
        "vulnerable_population_pct": 38.0,
        "population_density_per_sqkm": 285,
        "latitude": 20.3888,
        "longitude": 78.1204
    },
    # India - Uttar Pradesh
    {
        "country": "India",
        "state": "Uttar Pradesh",
        "district": "Varanasi Rural",
        "region_id": "IND-UP-VAR",
        "population": 920000,
        "households": 225000,
        "schools_count": 590,
        "hospitals_count": 42,
        "rural_population_pct": 62.0,
        "vulnerable_population_pct": 29.5,
        "population_density_per_sqkm": 680,
        "latitude": 25.3176,
        "longitude": 82.9739
    },
    # Brazil - Minas Gerais
    {
        "country": "Brazil",
        "state": "Minas Gerais",
        "district": "Jequitinhonha",
        "region_id": "BRA-MG-JEQ",
        "population": 290000,
        "households": 78000,
        "schools_count": 140,
        "hospitals_count": 12,
        "rural_population_pct": 58.0,
        "vulnerable_population_pct": 34.0,
        "population_density_per_sqkm": 140,
        "latitude": -16.4342,
        "longitude": -41.0039
    },
    # South Africa - Limpopo
    {
        "country": "South Africa",
        "state": "Limpopo",
        "district": "Vhembe",
        "region_id": "ZAF-LP-VHE",
        "population": 420000,
        "households": 110000,
        "schools_count": 210,
        "hospitals_count": 15,
        "rural_population_pct": 76.0,
        "vulnerable_population_pct": 41.0,
        "population_density_per_sqkm": 195,
        "latitude": -22.9556,
        "longitude": 30.4633
    }
]

# Baseline Infrastructure Indices (0-100 score, where 100 is best, <40 is critically deficient)
INITIAL_INFRASTRUCTURE: List[Dict[str, Any]] = [
    {
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "region_id": "IND-TG-WAR",
        "road_index": 31.0, # CRITICAL DEFICIT
        "water_index": 68.0,
        "healthcare_index": 54.0,
        "education_index": 59.0,
        "waste_management_index": 42.0,
        "electricity_index": 72.0,
        "public_transport_index": 38.0,
        "last_survey_year": 2025
    },
    {
        "country": "India",
        "state": "Telangana",
        "district": "Adilabad",
        "region_id": "IND-TG-ADI",
        "road_index": 48.0,
        "water_index": 28.0, # CRITICAL DEFICIT
        "healthcare_index": 35.0, # CRITICAL DEFICIT
        "education_index": 52.0,
        "waste_management_index": 38.0,
        "electricity_index": 58.0,
        "public_transport_index": 32.0,
        "last_survey_year": 2025
    },
    {
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "region_id": "IND-AP-ANA",
        "road_index": 62.0,
        "water_index": 34.0, # CRITICAL DEFICIT
        "healthcare_index": 32.0, # CRITICAL DEFICIT
        "education_index": 65.0,
        "waste_management_index": 51.0,
        "electricity_index": 64.0,
        "public_transport_index": 46.0,
        "last_survey_year": 2025
    },
    {
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "region_id": "IND-AP-KUR",
        "road_index": 58.0,
        "water_index": 52.0,
        "healthcare_index": 58.0,
        "education_index": 61.0,
        "waste_management_index": 29.0, # CRITICAL DEFICIT
        "electricity_index": 69.0,
        "public_transport_index": 50.0,
        "last_survey_year": 2025
    },
    {
        "country": "India",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "region_id": "IND-MH-YAV",
        "road_index": 44.0,
        "water_index": 26.0, # CRITICAL DEFICIT
        "healthcare_index": 42.0,
        "education_index": 57.0,
        "waste_management_index": 46.0,
        "electricity_index": 61.0,
        "public_transport_index": 39.0,
        "last_survey_year": 2025
    },
    {
        "country": "India",
        "state": "Uttar Pradesh",
        "district": "Varanasi Rural",
        "region_id": "IND-UP-VAR",
        "road_index": 54.0,
        "water_index": 48.0,
        "healthcare_index": 62.0,
        "education_index": 37.0, # CRITICAL DEFICIT
        "waste_management_index": 33.0, # CRITICAL DEFICIT
        "electricity_index": 56.0,
        "public_transport_index": 58.0,
        "last_survey_year": 2025
    },
    {
        "country": "Brazil",
        "state": "Minas Gerais",
        "district": "Jequitinhonha",
        "region_id": "BRA-MG-JEQ",
        "road_index": 33.0, # CRITICAL DEFICIT
        "water_index": 45.0,
        "healthcare_index": 52.0,
        "education_index": 60.0,
        "waste_management_index": 41.0,
        "electricity_index": 70.0,
        "public_transport_index": 35.0,
        "last_survey_year": 2025
    },
    {
        "country": "South Africa",
        "state": "Limpopo",
        "district": "Vhembe",
        "region_id": "ZAF-LP-VHE",
        "road_index": 46.0,
        "water_index": 27.0, # CRITICAL DEFICIT
        "healthcare_index": 40.0,
        "education_index": 54.0,
        "waste_management_index": 35.0,
        "electricity_index": 54.0,
        "public_transport_index": 38.0,
        "last_survey_year": 2025
    }
]

# Existing Government Projects (Active & Planned Public Works)
INITIAL_PROJECTS: List[Dict[str, Any]] = [
    {
        "project_id": "GP-IND-TG-001",
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "region_id": "IND-TG-WAR",
        "title": "Mission Bhagiratha Water Pipeline Extension Phase II",
        "category": "Water & Sanitation",
        "subcategory": "Pipeline Distribution",
        "budget_allocated_inr_cr": 45.5,
        "budget_allocated_usd_m": 5.45,
        "status": "In Progress",
        "completion_percentage": 78.0,
        "implementing_agency": "Rural Water Supply & Sanitation (RWSS)",
        "target_completion_date": "2026-11-30",
        "target_population": 48000,
        "related_community_needs": ["Piped Drinking Water Supply", "Fluoride Treatment"]
    },
    {
        "project_id": "GP-IND-TG-002",
        "country": "India",
        "state": "Telangana",
        "district": "Adilabad",
        "region_id": "IND-TG-ADI",
        "title": "ITDA Tribal Electrification & Solar Micro-Grid",
        "category": "Power & Energy",
        "subcategory": "Renewable Power",
        "budget_allocated_inr_cr": 18.2,
        "budget_allocated_usd_m": 2.18,
        "status": "Completed",
        "completion_percentage": 100.0,
        "implementing_agency": "Integrated Tribal Development Agency",
        "target_completion_date": "2025-12-15",
        "target_population": 22000,
        "related_community_needs": ["Tribal Hamlet Power", "Off-grid Solar"]
    },
    {
        "project_id": "GP-IND-AP-001",
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "region_id": "IND-AP-ANA",
        "title": "Nadu-Nedu Government School Modernization",
        "category": "Education",
        "subcategory": "School Infrastructure",
        "budget_allocated_inr_cr": 32.0,
        "budget_allocated_usd_m": 3.84,
        "status": "In Progress",
        "completion_percentage": 65.0,
        "implementing_agency": "Samagra Shiksha Abhiyan AP",
        "target_completion_date": "2026-10-15",
        "target_population": 36000,
        "related_community_needs": ["Classroom Structural Repair", "Smart Labs"]
    },
    {
        "project_id": "GP-IND-AP-002",
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "region_id": "IND-AP-KUR",
        "title": "Tungabhadra Basin Water Augmentation Scheme",
        "category": "Water & Sanitation",
        "subcategory": "Drinking Water Supply",
        "budget_allocated_inr_cr": 28.5,
        "budget_allocated_usd_m": 3.42,
        "status": "Delayed",
        "completion_percentage": 42.0,
        "implementing_agency": "AP Urban Infrastructure Development Corp",
        "target_completion_date": "2027-03-31",
        "target_population": 52000,
        "related_community_needs": ["Urban Water Distribution", "Storage Sump"]
    },
    {
        "project_id": "GP-IND-MH-001",
        "country": "India",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "region_id": "IND-MH-YAV",
        "title": "District Hospital Maternity Wing Extension",
        "category": "Healthcare",
        "subcategory": "Hospital Upgrade",
        "budget_allocated_inr_cr": 14.0,
        "budget_allocated_usd_m": 1.68,
        "status": "In Progress",
        "completion_percentage": 85.0,
        "implementing_agency": "Public Health Department MH",
        "target_completion_date": "2026-09-30",
        "target_population": 40000,
        "related_community_needs": ["Maternal Health Subcenter", "Neonatal Care"]
    }
]

# Baseline Multilingual Citizen Requests
SEED_REQUESTS_TEMPLATE = [
    {
        "raw_text": "మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.",
        "translated_text": "Our village has poor roads and students have difficulty reaching school during the rainy season, and ambulances cannot enter.",
        "language": "Telugu",
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "locality": "Chennaraopet Mandal",
        "latitude": 17.9620,
        "longitude": 79.6120,
        "category": "Transportation",
        "subcategory": "Rural Road Connectivity",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Students & Patients",
        "is_voice": True,
        "voice_duration_sec": 14.2
    },
    {
        "raw_text": "The 12km connecting link from Narsampet to our village is completely eroded with deep craters. Farmers cannot transport paddy produce to the market yard.",
        "translated_text": "The 12km connecting link from Narsampet to our village is completely eroded with deep craters. Farmers cannot transport paddy produce to the market yard.",
        "language": "English",
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "locality": "Narsampet Rural",
        "latitude": 17.9250,
        "longitude": 79.8920,
        "category": "Transportation",
        "subcategory": "Rural Road Connectivity",
        "severity": 8,
        "urgency": "High",
        "affected_group": "Farmers & Commuters",
        "is_voice": False
    },
    {
        "raw_text": "గ్రామ పంచాయతీ రహదారి కొట్టుకుపోయింది. బస్సు సర్వీస్ ఆపేశారు. విద్యార్థులు 5 కిలోమీటర్లు నడవాల్సి వస్తోంది.",
        "translated_text": "The Gram Panchayat main road was washed away. RTC bus service has been suspended. High school students are forced to walk 5 kilometers daily.",
        "language": "Telugu",
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "locality": "Geesugonda",
        "latitude": 17.9890,
        "longitude": 79.6450,
        "category": "Transportation",
        "subcategory": "Rural Road Connectivity",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Students",
        "is_voice": True,
        "voice_duration_sec": 11.5
    },
    {
        "raw_text": "మా ఆదివాసీ గూడెంలో బోరుబావుల్లో నీరు కలుషితమైంది. చాలా మంది పిల్లలు కామెర్లు మరియు డయేరియాతో బాధపడుతున్నారు. శుద్ధమైన తాగునీటి వ్యవస్థ కావాలి.",
        "translated_text": "In our tribal hamlet, borewell water is heavily contaminated. Many children are suffering from jaundice and diarrhea. We urgently need a clean drinking water filtration unit.",
        "language": "Telugu",
        "country": "India",
        "state": "Telangana",
        "district": "Adilabad",
        "locality": "Utnoor ITDA Agency",
        "latitude": 19.3667,
        "longitude": 78.7833,
        "category": "Water & Sanitation",
        "subcategory": "Safe Drinking Water",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Tribal Families & Children",
        "is_voice": True,
        "voice_duration_sec": 16.8
    },
    {
        "raw_text": "हमारे प्राथमिक स्वास्थ्य उपकेंद्र में कोई डॉक्टर या नर्स उपलब्ध नहीं है, आपातकालीन स्थिति में 40 किलोमीटर दूर जाना पड़ता है।",
        "translated_text": "There is no doctor or nurse stationed at our primary health sub-center; in medical emergencies we must travel 40 kilometers to the district hospital.",
        "language": "Hindi",
        "country": "India",
        "state": "Telangana",
        "district": "Adilabad",
        "locality": "Jainath Mandal",
        "latitude": 19.7340,
        "longitude": 78.6520,
        "category": "Healthcare",
        "subcategory": "Primary Health Clinic Access",
        "severity": 8,
        "urgency": "High",
        "affected_group": "Pregnant Women & Elderly",
        "is_voice": False
    },
    {
        "raw_text": "The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators and baby warmers stop working.",
        "translated_text": "The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators and baby warmers stop working.",
        "language": "English",
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "locality": "Kalyanadurg",
        "latitude": 14.5500,
        "longitude": 77.1000,
        "category": "Healthcare",
        "subcategory": "Hospital Power & Emergency Care",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Newborns & Critical Patients",
        "is_voice": False
    },
    {
        "raw_text": "మా మండల ఆసుపత్రిలో అంబులెన్స్ సదుపాయం లేదు. రాత్రి వేళల్లో ప్రమాదాలు జరిగితే క్షతగాత్రులను తీసుకెళ్లడానికి ప్రైవేట్ వాహనాలపై ఆధారపడాల్సి వస్తోంది.",
        "translated_text": "Our mandal hospital has no ambulance facility. In night emergencies, accident victims must rely on expensive private auto-rickshaws.",
        "language": "Telugu",
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "locality": "Dharmavaram Rural",
        "latitude": 14.4140,
        "longitude": 77.7210,
        "category": "Healthcare",
        "subcategory": "Ambulance & Emergency Response",
        "severity": 8,
        "urgency": "High",
        "affected_group": "General Public",
        "is_voice": True,
        "voice_duration_sec": 13.0
    },
    {
        "raw_text": "మార్కెట్ యార్డ్ దగ్గర మురుగు కాలువలు పూడిక తీయకపోవడం వల్ల దోమల బెడద ఎక్కువైంది. డెంగ్యూ కేసులు పెరుగుతున్నాయి.",
        "translated_text": "Due to uncleaned drainage channels near the market yard, stagnant water and mosquito breeding have spiked. Dengue cases are surging in the surrounding colony.",
        "language": "Telugu",
        "country": "India",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "locality": "Old Kurnool Market",
        "latitude": 15.8340,
        "longitude": 78.0410,
        "category": "Waste Management",
        "subcategory": "Urban Drainage & Sanitation",
        "severity": 8,
        "urgency": "High",
        "affected_group": "Residents & Shopkeepers",
        "is_voice": False
    },
    {
        "raw_text": "हमारे गांव में पिछले 25 दिनों से पीने का पानी नहीं आया है। महिलाओं को 3 किलोमीटर दूर कुएं से पानी लाना पड़ रहा है।",
        "translated_text": "Our village has received no drinking water tanker for 25 days. Women and young girls walk 3 kilometers in extreme heat to fetch water from deep open wells.",
        "language": "Hindi",
        "country": "India",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "locality": "Ghatanji Taluka",
        "latitude": 20.1340,
        "longitude": 78.3180,
        "category": "Water & Sanitation",
        "subcategory": "Rural Water Tankers & Piped Supply",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Women & Rural Households",
        "is_voice": True,
        "voice_duration_sec": 15.4
    },
    {
        "raw_text": "हमारे ब्लॉक के प्राथमिक विद्यालय में बरसात के समय जलभराव हो जाता है और बिजली का कनेक्शन नहीं होने से बच्चे गर्मी में पढ़ नहीं पाते।",
        "translated_text": "The primary school in our block gets severely waterlogged during monsoons, and without electricity connection, children suffer in extreme summer heat.",
        "language": "Hindi",
        "country": "India",
        "state": "Uttar Pradesh",
        "district": "Varanasi Rural",
        "locality": "Pindra Block",
        "latitude": 25.4833,
        "longitude": 82.8500,
        "category": "Education",
        "subcategory": "School Infrastructure & Electrification",
        "severity": 8,
        "urgency": "High",
        "affected_group": "School Children",
        "is_voice": False
    },
    {
        "raw_text": "A ponte de madeira que liga nossa comunidade rural à cidade principal está desabando. O ônibus escolar não consegue mais passar.",
        "translated_text": "The wooden bridge connecting our rural community to the main town is collapsing. The school bus can no longer cross safely.",
        "language": "Portuguese",
        "country": "Brazil",
        "state": "Minas Gerais",
        "district": "Jequitinhonha",
        "locality": "Vale do Jequitinhonha",
        "latitude": -16.4250,
        "longitude": -41.0120,
        "category": "Transportation",
        "subcategory": "Rural Bridge Reconstruction",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Students & Agricultural Workers",
        "is_voice": True,
        "voice_duration_sec": 12.0
    },
    {
        "raw_text": "Our community taps have been dry for six weeks. School learners are sharing unsafe river water, resulting in stomach infections.",
        "translated_text": "Our community taps have been dry for six weeks. School learners are sharing unsafe river water, resulting in stomach infections.",
        "language": "English",
        "country": "South Africa",
        "state": "Limpopo",
        "district": "Vhembe",
        "locality": "Thohoyandou Rural",
        "latitude": -22.9450,
        "longitude": 30.4720,
        "category": "Water & Sanitation",
        "subcategory": "Piped Potable Water",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Learners & Community Families",
        "is_voice": False
    }
]

def generate_full_synthetic_requests() -> List[Dict[str, Any]]:
    requests = []
    base_time = datetime.now() - timedelta(days=28)
    req_counter = 1001
    
    for item in SEED_REQUESTS_TEMPLATE:
        req_id = f"REQ-{item['state'][:2].upper()}-{req_counter}"
        created_time = (base_time + timedelta(days=(req_counter % 25), hours=(req_counter % 24), minutes=(req_counter % 60))).strftime("%Y-%m-%d %H:%M:%S")
        requests.append({
            "request_id": req_id,
            "created_at": created_time,
            "raw_text": item["raw_text"],
            "translated_text": item["translated_text"],
            "language": item["language"],
            "country": item["country"],
            "state": item["state"],
            "district": item["district"],
            "locality": item.get("locality", "General District Area"),
            "latitude": item["latitude"],
            "longitude": item["longitude"],
            "is_voice": item["is_voice"],
            "voice_duration_sec": item.get("voice_duration_sec", 12.0 if item["is_voice"] else None),
            "category": item["category"],
            "subcategory": item["subcategory"],
            "severity": item["severity"],
            "urgency": item["urgency"],
            "affected_group": item["affected_group"],
            "status": "Under Policy Review"
        })
        req_counter += 1

    districts_distribution = [
        ("Warangal", "Telangana", "India", 17.9784, 79.5941, "Transportation", "Rural Road Connectivity", 32),
        ("Adilabad", "Telangana", "India", 19.6641, 78.5320, "Water & Sanitation", "Safe Drinking Water", 24),
        ("Anantapur", "Andhra Pradesh", "India", 14.6819, 77.6006, "Healthcare", "Primary Health Clinic Access", 20),
        ("Yavatmal", "Maharashtra", "India", 20.3888, 78.1204, "Water & Sanitation", "Rural Water Supply", 18),
        ("Kurnool", "Andhra Pradesh", "India", 15.8281, 78.0373, "Waste Management", "Urban Drainage", 14),
        ("Varanasi Rural", "Uttar Pradesh", "India", 25.3176, 82.9739, "Education", "School Electrification", 12),
        ("Jequitinhonha", "Minas Gerais", "Brazil", -16.4342, -41.0039, "Transportation", "Bridge Infrastructure", 8),
        ("Vhembe", "Limpopo", "South Africa", -22.9556, 30.4633, "Water & Sanitation", "Piped Water", 6)
    ]

    for dist, state, country, lat, lon, cat, subcat, count in districts_distribution:
        for i in range(count):
            req_id = f"REQ-{state[:2].upper()}-{req_counter}"
            jitter_lat = lat + ((i % 7) - 3) * 0.015
            jitter_lon = lon + ((i % 5) - 2) * 0.018
            days_ago = (i * 3) % 27
            created_time = (datetime.now() - timedelta(days=days_ago, hours=(i * 4) % 24, minutes=(i * 13) % 60)).strftime("%Y-%m-%d %H:%M:%S")
            
            is_voice = (i % 3 == 0)
            lang = "Telugu" if state in ["Telangana", "Andhra Pradesh"] and i % 2 == 0 else ("Hindi" if state in ["Maharashtra", "Uttar Pradesh"] or i % 3 == 1 else "English")
            if country == "Brazil":
                lang = "Portuguese"
            
            sev = 7 + (i % 4)
            urg = "Critical" if sev >= 9 else ("High" if sev >= 7 else "Medium")
            
            raw = f"Issue report regarding {subcat.lower()} in {dist} sector {i+1}. Community access and safety compromised."
            trans = raw
            if lang == "Telugu":
                raw = f"{dist} ప్రాంతంలో {subcat} సమస్య తీవ్రంగా ఉంది. ప్రజలు చాలా ఇబ్బందులు పడుతున్నారు."
                trans = f"Severe issue regarding {subcat} in {dist} area. Citizens and local families are facing critical hardship."
            elif lang == "Hindi":
                raw = f"{dist} क्षेत्र में {subcat} की भारी समस्या है, जल्द से जल्द सुधार किया जाए।"
                trans = f"Major crisis regarding {subcat} in {dist} region, urgent government action is requested."
            elif lang == "Portuguese":
                raw = f"Problema grave com {subcat} na região de {dist}. Precisamos de intervenção pública urgente."
                trans = f"Severe problem with {subcat} in {dist} region. Urgent public intervention is needed."

            requests.append({
                "request_id": req_id,
                "created_at": created_time,
                "raw_text": raw,
                "translated_text": trans,
                "language": lang,
                "country": country,
                "state": state,
                "district": dist,
                "locality": f"Sector {i+1} Area",
                "latitude": round(jitter_lat, 4),
                "longitude": round(jitter_lon, 4),
                "is_voice": is_voice,
                "voice_duration_sec": round(8.5 + (i % 12), 1) if is_voice else None,
                "category": cat,
                "subcategory": subcat,
                "severity": sev,
                "urgency": urg,
                "affected_group": "Commuters & Families" if cat == "Transportation" else ("Rural Households" if cat == "Water & Sanitation" else "General Public"),
                "status": "Under Policy Review"
            })
            req_counter += 1

    return requests
