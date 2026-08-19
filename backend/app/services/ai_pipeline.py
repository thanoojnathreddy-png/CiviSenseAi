import re
from typing import Dict, Any, List, Optional
from app.models.request_models import AIStructuredExtraction, VoiceTranscribeResponse

# Multilingual Vocabulary & Entity Dictionaries for BRICS & Indian Languages
CATEGORY_KEYWORDS = {
    "Transportation": [
        "road", "roads", "pothole", "bridge", "connectivity", "bus", "transport", "highway", "traffic",
        "రోడ్డు", "రహదారి", "వంతెన", "బస్సు", "రవాణా", "గుంతలు", # Telugu
        "सड़क", "रास्ता", "पुल", "बस", "परिवहन", "मार्ग", "गड्ढे", # Hindi
        "ponte", "estrada", "rodovia", "transporte", "ônibus", # Portuguese
        "дорога", "мост", "транспорт", "автобус", # Russian
        "道路", "桥梁", "交通", "公交" # Chinese
    ],
    "Water & Sanitation": [
        "water", "drinking water", "pipeline", "borewell", "contamination", "leakage", "drain", "sewage", "drought", "tanker", "fluoride",
        "నీరు", "నీళ్ళు", "తాగునీరు", "బోరుబావి", "పైప్‌లైన్", "మురుగు", "కలుషిత", "ట్యాంకర్", # Telugu
        "पानी", "जल", "पीने का पानी", "बोरवेल", "पाइपलाइन", "नाली", "सीवर", "टैंकर", "सूखा", # Hindi
        "água", "água potável", "esgoto", "saneamento", "poço", "encanamento", # Portuguese
        "вода", "питьевая вода", "трубопровод", "канализация", # Russian
        "水", "饮用水", "管道", "排污", "干旱" # Chinese
    ],
    "Healthcare": [
        "hospital", "doctor", "clinic", "phc", "medicine", "ambulance", "patient", "disease", "health", "fever", "emergency", "maternity",
        "ఆసుపత్రి", "వైద్యుడు", "మందులు", "అంబులెన్స్", "రోగి", "వ్యాధి", "ఆరోగ్యం", "కామెర్లు", "డెంగ్యూ", # Telugu
        "अस्पताल", "डॉक्टर", "दवा", "एम्बुलेंस", "मरीज", "बीमारी", "स्वास्थ्य", "उपचार", "प्राथमिक स्वास्थ्य", # Hindi
        "hospital", "médico", "posto de saúde", "ambulância", "remédio", "doença", "saúde", # Portuguese
        "больница", "врач", "поликлиника", "скорая помощь", "лекарства", # Russian
        "医院", "医生", "诊所", "救护车", "药品", "卫生" # Chinese
    ],
    "Education": [
        "school", "college", "teacher", "classroom", "student", "study", "books", "education", "blackboard",
        "బడి", "పాఠశాల", "ఉపాధ్యాయుడు", "తరగతి గది", "విద్యార్థి", "చదువు", "పుస్తకాలు", # Telugu
        "स्कूल", "विद्यालय", "शिक्षक", "कक्षा", "छात्र", "पढ़ाई", "शिक्षा", # Hindi
        "escola", "professor", "sala de aula", "aluno", "estudante", "educação", # Portuguese
        "школа", "учитель", "класс", "ученик", "образование", # Russian
        "学校", "老师", "教室", "学生", "教育" # Chinese
    ],
    "Waste Management": [
        "garbage", "waste", "trash", "dump", "drainage", "clogged", "pollution", "mosquito",
        "చెత్త", "మురుగు కాలువ", "కాలుష్యం", "దోమలు", "చెత్తకుండీ", # Telugu
        "कचरा", "कूड़ा", "गंदगी", "नाली जाम", "मच्छर", "प्रदूषण", # Hindi
        "lixo", "entulho", "drenagem", "resíduos", # Portuguese
        "мусор", "свалка", "отходы", "дренаж", # Russian
        "垃圾", "废物", "排污", "积水" # Chinese
    ],
    "Power & Energy": [
        "electricity", "power cut", "light", "street light", "transformer", "load shedding", "solar", "blackout",
        "కరెంట్", "విద్యుత్", "లైట్లు", "ట్రాన్స్‌ఫార్మర్", "కరెంట్ కోత", "సోలార్", # Telugu
        "बिजली", "करंट", "स्ट्रीट लाइट", "ट्रांसफार्मर", "बिजली कटौती", "सौर ऊर्जा", # Hindi
        "eletricidade", "energia", "apagão", "transformador", "iluminação", # Portuguese
        "электричество", "свет", "трансформатор", # Russian
        "电力", "停电", "路灯", "变压器" # Chinese
    ]
}

# Subcategory Mappings
SUBCATEGORY_MAP = {
    "Transportation": {
        "bridge": "Rural Bridge Reconstruction",
        "bus": "Public Transit & Bus Connectivity",
        "school": "Safe School Route Roadway",
        "default": "Rural Road Connectivity & Upgradation"
    },
    "Water & Sanitation": {
        "drinking": "Safe Piped Drinking Water Supply",
        "borewell": "Borewell Rejuvenation & Fluoride Treatment",
        "drain": "Village Drainage & Sanitation Line",
        "default": "Community Potable Water Infrastructure"
    },
    "Healthcare": {
        "ambulance": "Ambulance & Emergency Response Network",
        "maternity": "Maternal & Child Health Care Facility",
        "power": "Hospital Solar Power & Critical Equipment Backup",
        "default": "Primary Health Sub-Center & Clinic Upgradation"
    },
    "Education": {
        "electrification": "School Electrification & Smart Classroom Support",
        "building": "School Building Structural Repair & Sanitation",
        "default": "School Infrastructure & Accessible Learning Facility"
    },
    "Waste Management": {
        "drainage": "Urban & Rural Stormwater Drainage De-clogging",
        "default": "Solid Waste Processing & Community Sanitation"
    },
    "Power & Energy": {
        "default": "24/7 Grid Reliability & Microgrid Infrastructure"
    }
}

# Known Translation Dictionary for realistic high-fidelity multilingual parsing
DEMO_TRANSLATIONS = {
    "మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.": 
        "Our village has severely damaged roads. During the rainy season, students face extreme hardship reaching school, and emergency ambulances cannot enter.",
    "మా ఆదివాసీ గూడెంలో బోరుబావుల్లో నీరు కలుషితమైంది. చాలా మంది పిల్లలు కామెర్లు మరియు డయేరియాతో బాధపడుతున్నారు. శుద్ధమైన తాగునీటి వ్యవస్థ కావాలి.":
        "In our tribal hamlet, borewell water is contaminated. Many children are suffering from jaundice and diarrhea. We urgently require a clean drinking water system.",
    "గ్రామ పంచాయతీ రహదారి కొట్టుకుపోయింది. బస్సు సర్వీస్ ఆపేశారు. విద్యార్థులు 5 కిలోమీటర్లు నడవాల్సి వస్తోంది.":
        "The Gram Panchayat road was completely washed out. Bus service has stopped, forcing students to walk 5 kilometers daily.",
    "మా మండల ఆసుపత్రిలో అంబులెన్స్ సదుపాయం లేదు. రాత్రి వేళల్లో ప్రమాదాలు జరిగితే క్షతగాత్రులను తీసుకెళ్లడానికి ప్రైవేట్ వాహనాలపై ఆధారపడాల్సి వస్తోంది.":
        "Our mandal hospital has no ambulance. In night emergencies, accident victims must depend on private transport.",
    "हमारे इलाके में पिछले 3 हफ्तों से पीने का साफ पानी नहीं आ रहा है, अस्पताल में मरीज बढ़ रहे हैं।":
        "Our area has had no clean drinking water for the past 3 weeks, and hospital patient admissions are surging due to waterborne illness.",
    "हमारे प्राथमिक स्वास्थ्य उपकेंद्र में कोई डॉक्टर या नर्स उपलब्ध नहीं है, आपातकालीन स्थिति में 40 किलोमीटर दूर जाना पड़ता है।":
        "No doctor or nurse is stationed at our primary health center; patients must travel 40 km in critical emergencies.",
    "हमारे गांव में पिछले 25 दिनों से पीने का पानी नहीं आया है। महिलाओं को 3 किलोमीटर दूर कुएं से पानी लाना पड़ रहा है।":
        "Our village has received no drinking water for 25 days. Women have to walk 3 kilometers to fetch open well water.",
    "हमारे ब्लॉक के प्राथमिक विद्यालय में बरसात के समय जलभराव हो जाता है और बिजली का कनेक्शन नहीं होने से बच्चे गर्मी में पढ़ नहीं पाते।":
        "The primary school in our block is severely waterlogged in rains, and without electricity connection, children cannot study in intense heat.",
    "A ponte de madeira que liga nossa comunidade rural à cidade principal está desabando. O ônibus escolar não consegue mais passar.":
        "The wooden bridge connecting our rural community to the main town is collapsing. The school bus can no longer pass.",
    "Our community taps have been dry for six weeks. School learners are sharing unsafe river water, resulting in stomach infections.":
        "Our community taps have been dry for six weeks. School learners are sharing unsafe river water, resulting in stomach infections."
}

# Voice Sample Registry for Interactive Demo Audio
DEMO_VOICE_SAMPLES = [
    {
        "sample_id": "VOICE-TEL-01",
        "title": "Road Washout & School Cutoff (Telugu)",
        "language": "Telugu",
        "district": "Warangal",
        "state": "Telangana",
        "duration": 14.2,
        "transcript": "మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు. అంబులెన్స్ కూడా రాలేకపోతోంది.",
        "category": "Transportation"
    },
    {
        "sample_id": "VOICE-HIN-01",
        "title": "Drinking Water Contamination & PHC Crisis (Hindi)",
        "language": "Hindi",
        "district": "Yavatmal",
        "state": "Maharashtra",
        "duration": 15.4,
        "transcript": "हमारे इलाके में पिछले 3 हफ्तों से पीने का साफ पानी नहीं आ रहा है, अस्पताल में मरीज बढ़ रहे हैं।",
        "category": "Water & Sanitation"
    },
    {
        "sample_id": "VOICE-ENG-01",
        "title": "Hospital Emergency Power & Ambulance Deficit (English)",
        "language": "English",
        "district": "Anantapur",
        "state": "Andhra Pradesh",
        "duration": 13.0,
        "transcript": "The Community Health Centre in Kalyanadurg suffers 6-hour daily power cuts with no generator backup. Oxygen concentrators and baby warmers stop working.",
        "category": "Healthcare"
    },
    {
        "sample_id": "VOICE-POR-01",
        "title": "Rural Bridge Collapse (Portuguese / Brazil)",
        "language": "Portuguese",
        "district": "Jequitinhonha",
        "state": "Minas Gerais",
        "duration": 12.0,
        "transcript": "A ponte de madeira que liga nossa comunidade rural à cidade principal está desabando. O ônibus escolar não consegue mais passar.",
        "category": "Transportation"
    }
]

class AIPipelineService:
    @staticmethod
    def detect_language(text: str) -> str:
        """Detects language script from text content."""
        # Telugu Unicode range: \u0C00-\u0C7F
        if re.search(r'[\u0C00-\u0C7F]', text):
            return "Telugu"
        # Devanagari / Hindi Unicode range: \u0900-\u097F
        elif re.search(r'[\u0900-\u097F]', text):
            return "Hindi"
        # Tamil Unicode range: \u0B80-\u0BFF
        elif re.search(r'[\u0B80-\u0BFF]', text):
            return "Tamil"
        # Cyrillic / Russian Unicode range: \u0400-\u04FF
        elif re.search(r'[\u0400-\u04FF]', text):
            return "Russian"
        # CJK / Chinese: \u4E00-\u9FFF
        elif re.search(r'[\u4E00-\u9FFF]', text):
            return "Chinese"
        # Portuguese specific accents or words
        elif any(w in text.lower() for w in ["não", "ponte", "escola", "água", "cidade", "saúde", "ônibus"]):
            return "Portuguese"
        else:
            return "English"

    @staticmethod
    def translate_to_english(text: str, detected_lang: str) -> str:
        """Translates citizen input to English for uniform policy analysis."""
        clean_text = text.strip()
        if clean_text in DEMO_TRANSLATIONS:
            return DEMO_TRANSLATIONS[clean_text]
        
        if detected_lang == "English":
            return clean_text
        
        # Rule-based fallback translation synthesis for live inputs
        if detected_lang == "Telugu":
            if "రోడ్డు" in text or "రహదారి" in text:
                return f"Citizen reports severe road damage and transportation disruption: '{clean_text}'"
            elif "నీరు" in text or "తాగునీరు" in text:
                return f"Citizen reports critical drinking water contamination or supply shortage: '{clean_text}'"
            elif "ఆసుపత్రి" in text or "వైద్యుడు" in text:
                return f"Citizen reports urgent healthcare and medical access deficiency: '{clean_text}'"
            elif "చెత్త" in text or "మురుగు" in text:
                return f"Citizen reports drainage overflow and sanitation hazards: '{clean_text}'"
            return f"Citizen developmental request (Telugu translated): '{clean_text}'"
        
        elif detected_lang == "Hindi":
            if "सड़क" in text or "रास्ता" in text:
                return f"Citizen reports damaged road network affecting daily connectivity: '{clean_text}'"
            elif "पानी" in text or "जल" in text:
                return f"Citizen reports acute drinking water scarcity or contamination: '{clean_text}'"
            elif "अस्पताल" in text or "डॉक्टर" in text:
                return f"Citizen reports primary healthcare clinic unavailability: '{clean_text}'"
            elif "बिजली" in text:
                return f"Citizen reports frequent power outages and grid failure: '{clean_text}'"
            return f"Citizen developmental request (Hindi translated): '{clean_text}'"
            
        elif detected_lang == "Portuguese":
            return f"Citizen infrastructure report (Portuguese translated): '{clean_text}'"

        return clean_text

    @classmethod
    def extract_structured_data(cls, text: str, location_hint: str = "Warangal", language_override: Optional[str] = None) -> AIStructuredExtraction:
        """Extracts structured entities, category, subcategory, severity, urgency, and affected groups."""
        detected_lang = language_override or cls.detect_language(text)
        translated = cls.translate_to_english(text, detected_lang)
        combined_text = (text + " " + translated).lower()

        # 1. Detect Category
        detected_category = "Transportation" # Default
        max_matches = 0
        for category, keywords in CATEGORY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw.lower() in combined_text)
            if matches > max_matches:
                max_matches = matches
                detected_category = category

        # 2. Detect Subcategory
        subcat_dict = SUBCATEGORY_MAP.get(detected_category, {})
        subcat = subcat_dict.get("default", f"{detected_category} Modernization")
        for trigger, name in subcat_dict.items():
            if trigger != "default" and trigger in combined_text:
                subcat = name
                break

        # 3. Severity & Urgency Scoring (1 to 10)
        base_severity = 7
        high_severity_terms = [
            "emergency", "ambulance", "children", "patients", "danger", "collapsed", "contaminated", "died", "jaundice", "dengue",
            "రాలేకపోతోంది", "కొట్టుకుపోయింది", "కలుషితమైంది", "డయేరియా", "తీవ్రంగా",
            "आपातकालीन", "मरीज", "बीमारी", "खतरा", "मौत", "दुर्घटना"
        ]
        moderate_terms = ["difficulty", "problem", "potholes", "repair", "delay", "walk", "ఇబ్బంది", "సమస్య", "समस्या", "परेशानी"]

        if any(term in combined_text for term in high_severity_terms):
            base_severity = 9
        elif any(term in combined_text for term in moderate_terms):
            base_severity = 8
        
        urgency = "Critical" if base_severity >= 9 else ("High" if base_severity >= 7 else "Medium")

        # 4. Identify Affected Group
        affected_group = "General Public"
        if any(w in combined_text for w in ["student", "students", "school", "పిల్లలు", "విద్యార్థులు", "बच्चे", "छात्र", "aluno"]):
            affected_group = "Students & School Children"
        elif any(w in combined_text for w in ["patient", "hospital", "ambulance", "doctor", "రోగ", "క్షతగాత్రులను", "मरीज"]):
            affected_group = "Patients & Vulnerable Groups"
        elif any(w in combined_text for w in ["farmer", "paddy", "crop", "market", "రైతులు", "किसान"]):
            affected_group = "Farmers & Commuters"
        elif any(w in combined_text for w in ["tribal", "hamlet", "ఆదివాసీ", "गूడెం", "जनजाति"]):
            affected_group = "Tribal Communities"
        elif any(w in combined_text for w in ["women", "girls", "fetch", "మహిళలు", "महिलाएं"]):
            affected_group = "Women & Households"

        # 5. Extract Entities
        entities = []
        words = text.split()
        if len(words) > 3:
            entities.append(location_hint)
        if detected_category:
            entities.append(detected_category)
        if subcat:
            entities.append(subcat)

        return AIStructuredExtraction(
            category=detected_category,
            subcategory=subcat,
            location=location_hint,
            severity=base_severity,
            urgency=urgency,
            affected_group=affected_group,
            language=detected_lang,
            translated_text=translated,
            key_entities=entities,
            sentiment="Critical / Distressed" if base_severity >= 9 else "Concerned",
            sentiment_score=-0.85 if base_severity >= 9 else -0.65
        )

    @classmethod
    def transcribe_voice(cls, sample_id: Optional[str] = None, language_hint: str = "Telugu") -> VoiceTranscribeResponse:
        """Simulates/handles speech-to-text with high accuracy for hackathon demo voice recordings."""
        if sample_id:
            for s in DEMO_VOICE_SAMPLES:
                if s["sample_id"] == sample_id:
                    return VoiceTranscribeResponse(
                        transcribed_text=s["transcript"],
                        detected_language=s["language"],
                        confidence=0.96,
                        duration_seconds=s["duration"]
                    )
        
        # Default sample based on language hint
        if language_hint.lower() == "telugu":
            sample = DEMO_VOICE_SAMPLES[0]
        elif language_hint.lower() == "hindi":
            sample = DEMO_VOICE_SAMPLES[1]
        elif language_hint.lower() == "portuguese":
            sample = DEMO_VOICE_SAMPLES[3]
        else:
            sample = DEMO_VOICE_SAMPLES[2]

        return VoiceTranscribeResponse(
            transcribed_text=sample["transcript"],
            detected_language=sample["language"],
            confidence=0.95,
            duration_seconds=sample["duration"]
        )
