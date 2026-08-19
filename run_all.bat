@echo off
echo ======================================================================
echo Starting CivicPulse AI - Multilingual Civic Intelligence Platform
echo ======================================================================

echo Starting Python FastAPI Backend on port 8000...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Vite React Frontend on port 5173...
start cmd /k "cd frontend && npm run dev"

echo CivicPulse AI is launching at http://localhost:5173
pause
