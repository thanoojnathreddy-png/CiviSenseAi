# CivicPulse AI (CiviSense AI)

> **Turning community needs into informed development decisions.**
> An Open Digital Public Good platform for multilingual civic intelligence and evidence-based public infrastructure planning across BRICS nations.

---

## 🌟 Overview

**CivicPulse AI** bridges the gap between multilingual citizen development requests (voice & text) and actionable infrastructure investment priorities for public authorities and policymakers.

The platform provides an end-to-end transparent decision-support pipeline:
$$\text{Citizen Request (Voice/Text)} \longrightarrow \text{Multilingual AI NLP} \longrightarrow \text{Data Integration} \longrightarrow \text{Demand Hotspots} \longrightarrow \text{Explainable Priority Scoring} \longrightarrow \text{DPR Recommendations} \longrightarrow \text{Public Decision Support}$$

---

## 🚀 Key Capabilities

### 1. Public Home Portal
- Calm, trustworthy public service gateway.
- High-level public indicators: **24,836 Citizen Requests**, **82 Infrastructure Gaps**, **37 High-Priority Needs**, **24 Areas Under Review**.
- Clear navigation: **"Share a Community Need"** and **"Explore Community Priorities"**.

### 2. Accessible Citizen Intake Portal
- Mobile-first public intake supporting native scripts: **Telugu (`తెలుగు`)**, **Hindi (`हिन्दी`)**, **English**, **Tamil (`தமிழ்`)**, **Portuguese (`Português`)**.
- Speech-to-text recording with real-time waveform visualizer animation.
- Real-time AI extraction displaying category, subcategory, urgency level, severity (1–10), affected groups, and standardized English translation.
- Community demand contribution tracking with unique reference codes.

### 3. Public Authority & Government Portal
- **Overview**: Executive briefing, key indicators, interactive demand hotspot map, and priority highlights.
- **Community Needs**: Aggregated demand clusters with volume trends (e.g. *Rural Road Connectivity: 2,843 requests, 18,420 affected residents, Increasing trend*).
- **Demand Map**: Interactive Leaflet geospatial map with density clusters, infrastructure deficit overlays, and click-to-open **District Diagnostics Drawer**.
- **Infrastructure**: Multi-sector benchmark comparisons across 7 sectors (Roads, Water, Healthcare, Education, Waste, Electricity, Public Transport).
- **Recommendations**: Explainable priority assessments with transparent mathematical factor breakdowns, plain-language justifications, verbatim citizen quotes, and DPR blueprints.
- **Development Projects**: Registry of active and planned public works with budget outlays, completion %, target population, and coverage gap detection.
- **Insights**: Analytical civic intelligence on emerging needs, infrastructure deficits, coverage gaps, and regional trends.
- **Data Explorer**: Searchable audit log of citizen feedback with native script, English translation, audio playback, and CSV export.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet, Recharts, Vite
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **AI & NLP**: Multilingual NLP extraction, speech-to-text transcription, sentiment & urgency scoring, transparent priority algorithm
- **Architecture**: Modular Digital Public Good framework with multi-country scalability (India, Brazil, South Africa, Russia, China)

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+) & pip

### 1. Run via Single Launch Script
```bash
./run_all.bat
```

### 2. Manual Setup

#### Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend (Vite + React):
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.
API Swagger documentation is available at **`http://localhost:8000/docs`**.

---

## 📜 Governance & Philosophy

CivicPulse AI adheres to the principle:
$$\text{Evidence} \longrightarrow \text{Analysis} \longrightarrow \text{Context} \longrightarrow \text{Recommendation} \longrightarrow \text{Human Decision}$$

The platform does not automate public governance; it empowers public authorities with transparent, explainable data to serve communities more equitably.
