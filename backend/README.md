# EcoImpact Workflow Backend (Hackathon Mock)

This FastAPI service simulates the entire EcoImpactWorkflow with hard-coded data so you can demo the product without live API keys. It powers the Next.js frontend and exposes extra endpoints for the marketplace and playbook pages.

## What’s inside

- **Framework**: FastAPI + Uvicorn.
- **Mocked orchestration**: The `/workflow` endpoint validates inputs, fabricates emissions + weather values, and runs a simulated Gemini retry loop. No real network calls are made.
- **Additional APIs** supporting the frontend narrative:
  - `GET /offset-projects` → mocked crowdsourced marketplace listings.
  - `GET /strategy-library` → AI mitigation strategies + playbooks.
  - `GET /executive-snapshot` → executive summary stats.
  - `POST /api/result` → optional hook the frontend uses to “log” results.
  - `GET /health` → readiness probe.

## Running locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

No API keys are required for the mocked workflow. Optional environment variables still exist for future upgrades, but can be ignored today.

## Workflow contract

`POST /workflow`

```json
{
  "distance": 1000,
  "lat": 40.7128,
  "lon": -74.006
}
```

Response:

```json
{
  "forecastResult": "Shift 35% of loads to rail partners ...",
  "decision": "approve",
  "emissions": 690.0,
  "weather": "Marine layer morning clouds, 12kt crosswinds",
  "analysisAttempts": [
    { "attempt": 1, "confidence": 0.74, "text": "..." },
    { "attempt": 2, "confidence": 0.85, "text": "..." }
  ],
  "playbook": [
    { "phase": "Sprint 1", "milestones": ["..."] }
  ]
}
```

If the simulated confidence never crosses `0.8`, the decision falls back to `"escalate"` with the standard low-confidence message.

## Tests

```powershell
cd backend
.\.venv\Scripts\activate
pytest
```

Tests cover:

- Happy path (approve decision, mocked data returned).
- Validation errors for bad input.
- Escalation when simulated confidence stays low.

## Deploying the backend separately

1. **Containerize (recommended)**
   - Add a lightweight `Dockerfile` that installs requirements and runs `uvicorn app.main:app`.
   - Push to any container host (Fly.io, Render, Azure Container Apps, etc.).
2. **Environment**
   - Expose port `8000` (or remap as needed).
   - Optional variables: `RESULT_LOG_PATH` if you want `/api/result` to persist logs.
3. **Production entry point**
   - Use `uvicorn app.main:app --host 0.0.0.0 --port $PORT` or `gunicorn -k uvicorn.workers.UvicornWorker app.main:app`.

Because all integrations are mocked, there are no external secrets to manage until you decide to wire real services back in.
