import asyncio
import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import GeminiResult, get_settings

logger = logging.getLogger("ecoimpact")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

app = FastAPI(title="EcoImpact Workflow API", version="2.0.0")


def _parse_env_csv(name: str) -> List[str]:
    raw_value = os.getenv(name, "")
    if not raw_value:
        return []
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def _combine_regexes(regexes: List[str]) -> Optional[str]:
    patterns = [pattern for pattern in regexes if pattern]
    if not patterns:
        return None
    if len(patterns) == 1:
        return patterns[0]
    return "|".join(f"(?:{pattern})" for pattern in patterns)


DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

DEFAULT_ALLOWED_ORIGIN_REGEXES = [
    r"https://.*\.railway\.app",
    r"https://.*\.vercel\.app",
]

CUSTOM_ALLOWED_ORIGINS = _parse_env_csv("CORS_ALLOWED_ORIGINS")
CUSTOM_ALLOWED_REGEXES = _parse_env_csv("CORS_ALLOWED_ORIGIN_REGEXES")

ALLOWED_ORIGINS = DEFAULT_ALLOWED_ORIGINS + CUSTOM_ALLOWED_ORIGINS
ALLOWED_ORIGIN_REGEX = _combine_regexes(DEFAULT_ALLOWED_ORIGIN_REGEXES + CUSTOM_ALLOWED_REGEXES)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCAL_RESULT_URL = "http://localhost:3000/api/result"
CONFIDENCE_THRESHOLD = 0.8

MOCK_EMISSION_SEGMENTS: Tuple[Dict[str, Optional[float]], ...] = (
    {"max_km": 250.0, "baseline": 90.0, "per_km": 0.62},
    {"max_km": 1200.0, "baseline": 210.0, "per_km": 0.48},
    {"max_km": None, "baseline": 480.0, "per_km": 0.41},
)

MOCK_WEATHER_PROFILES: Tuple[Dict[str, Any], ...] = (
    {
        "label": "NYC Coastal Corridor",
        "lat": 40.7128,
        "lon": -74.0060,
        "radius": 1.5,
        "forecast": "Marine layer morning clouds, 12kt crosswinds",
    },
    {
        "label": "LA Basin",
        "lat": 34.0522,
        "lon": -118.2437,
        "radius": 1.8,
        "forecast": "Sunny with port congestion advisories",
    },
    {
        "label": "Austin Innovation Belt",
        "lat": 30.2672,
        "lon": -97.7431,
        "radius": 1.4,
        "forecast": "Dry heatwave, watch tire pressure on trailers",
    },
)

MOCK_ANALYSIS_TEMPLATES: Tuple[Dict[str, Any], ...] = (
    {
        "text": "Bundle regional drops into a hybrid route leveraging {weather}. Transition driver rest stops to solar microgrids.",
        "base_confidence": 0.68,
    },
    {
        "text": "Shift 35% of loads to rail partners and contract regenerative diesel for the remaining legs. {weather} enables flexible scheduling within 36 hours.",
        "base_confidence": 0.79,
    },
    {
        "text": "Activate the EcoImpact offset marketplace and pre-book carbon removal credits. Launch driver incentive to reduce idle time by 22%.",
        "base_confidence": 0.85,
    },
)

MOCK_OFFSET_PROJECTS: Tuple[Dict[str, Any], ...] = (
    {
        "id": "project-urban-forest",
        "title": "Bronx Urban Forest Pods",
        "summary": "Partner with local co-ops to plant modular micro-forests that cool logistics corridors.",
        "pricePerTonne": 14.5,
        "expectedImpact": "1,200 tCO2e avoided in 24 months",
        "sdgAlignment": ["SDG 11", "SDG 13", "SDG 15"],
        "status": "funding",
    },
    {
        "id": "project-blue-carbon",
        "title": "Gulf Coast Blue Carbon Labs",
        "summary": "Restore wetlands with autonomous drones capturing methane hotspots.",
        "pricePerTonne": 22.0,
        "expectedImpact": "2,750 tCO2e sequestered annually",
        "sdgAlignment": ["SDG 9", "SDG 13", "SDG 14"],
        "status": "live",
    },
    {
        "id": "project-biochar",
        "title": "Appalachia Biochar Collective",
        "summary": "Convert sawmill waste into regenerative soil biochar with community revenue-sharing.",
        "pricePerTonne": 18.75,
        "expectedImpact": "950 tCO2e locked per crop cycle",
        "sdgAlignment": ["SDG 8", "SDG 12", "SDG 13"],
        "status": "waitlist",
    },
)

MOCK_STRATEGY_LIBRARY: Tuple[Dict[str, Any], ...] = (
    {
        "id": "strategy-modal-shift",
        "name": "Modal Shift to Rail + Microhubs",
        "category": "Logistics",
        "expectedReduction": "-38%",
        "playbook": [
            "Stand up 2 regional micro-fulfillment hubs with cross-docking sensors",
            "Integrate rail API for live capacity swaps",
            "Gamify carrier engagement with scorecards",
        ],
    },
    {
        "id": "strategy-h2",
        "name": "Hydrogen-ready Fleet Pilot",
        "category": "Fleet",
        "expectedReduction": "-21%",
        "playbook": [
            "Lease 10 fuel-cell trucks in California ZEV corridor",
            "Install mobile electrolyzer pods at partner depots",
            "Instrument telemetry for energy-per-drop KPI",
        ],
    },
    {
        "id": "strategy-rag",
        "name": "AI-powered Mitigation RAG",
        "category": "AI",
        "expectedReduction": "-17%",
        "playbook": [
            "Index EPA SmartWay + IPCC AR6 briefs into vector store",
            "Launch Gemini action copilot for route planners",
            "Trigger auto-mitigation tasks into Asana via webhook",
        ],
    },
)

MOCK_EXECUTIVE_SNAPSHOT: Dict[str, Any] = {
    "headline": "12.4% carbon intensity drop this sprint",
    "weeklyCarbonDelta": -12.4,
    "runsOptimized": 18,
    "teamSentiment": 4.6,
    "wins": [
        "Swapped 6 lanes to regenerative diesel",
        "Activated 142 offset credits via marketplace",
        "Launched API integration with ERP for auto-mitigation tasks",
    ],
    "focus": [
        "Expand hydrogen pilot to Midwest corridor",
        "Codify sustainability OKRs in driver scorecards",
        "Publish RAG-backed mitigation newsletter",
    ],
}


def _parse_numeric(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _estimate_emissions(distance: float) -> float:
    for segment in MOCK_EMISSION_SEGMENTS:
        if segment["max_km"] is None or distance <= float(segment["max_km"]):
            baseline = float(segment["baseline"]) + distance * float(segment["per_km"])
            value = round(baseline, 2)
            logger.info("Simulated emissions computed", extra={"distance": distance, "emissions": value})
            return value
    value = round(0.42 * distance + 240.0, 2)
    logger.info("Fallback emissions computation", extra={"distance": distance, "emissions": value})
    return value


def _select_weather_profile(lat: float, lon: float) -> str:
    for profile in MOCK_WEATHER_PROFILES:
        within_lat = abs(lat - float(profile["lat"])) <= float(profile["radius"])
        within_lon = abs(lon - float(profile["lon"])) <= float(profile["radius"])
        if within_lat and within_lon:
            logger.info("Matched weather profile", extra={"profile": profile["label"]})
            return str(profile["forecast"])
    default_forecast = "Clear skies with adaptive logistics window"
    logger.info("Default weather profile selected", extra={"lat": lat, "lon": lon})
    return default_forecast


def _confidence_adjustment(emissions: float) -> float:
    if emissions < 400:
        return 0.12
    if emissions < 900:
        return 0.06
    if emissions < 1400:
        return 0.0
    return -0.08


async def _mock_gemini_loop(emissions: float, weather: str) -> Tuple[GeminiResult, List[Dict[str, Any]]]:
    adjustment = _confidence_adjustment(emissions)
    attempts_summary: List[Dict[str, Any]] = []
    for attempt_index, template in enumerate(MOCK_ANALYSIS_TEMPLATES, start=1):
        confidence = max(min(template["base_confidence"] + adjustment, 0.95), 0.0)
        text = template["text"].format(weather=weather, emissions=emissions)
        attempts_summary.append(
            {
                "attempt": attempt_index,
                "confidence": round(confidence, 2),
                "text": text,
            }
        )
        logger.info(
            "Gemini mock analysis",
            extra={"attempt": attempt_index, "confidence": confidence, "text": text},
        )
        await asyncio.sleep(0.05)
        if confidence >= CONFIDENCE_THRESHOLD:
            return GeminiResult(text=text, confidence=confidence), attempts_summary
    last_attempt = attempts_summary[-1]
    return GeminiResult(text=last_attempt["text"], confidence=float(last_attempt["confidence"])), attempts_summary


async def _post_local_result(result_text: str) -> None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                LOCAL_RESULT_URL,
                headers={"Content-Type": "application/json"},
                json={"result": result_text},
            )
            response.raise_for_status()
            logger.info("Mock result forwarded to frontend logger")
    except httpx.HTTPError as exc:
        logger.warning("Unable to post result to frontend logger", extra={"error": str(exc)})


def _build_playbook(distance: float, emissions: float, decision: str) -> List[Dict[str, Any]]:
    return [
        {
            "phase": "Sprint 1",
            "horizon": "Next 30 days",
            "headline": "Instrument the lane",
            "milestones": [
                "Deploy IoT beacons on high-impact trailers",
                "Activate carbon telemetry dashboard",
                f"Baseline intensity: {round(emissions / max(distance, 1), 2)} kg/km",
            ],
        },
        {
            "phase": "Sprint 2",
            "horizon": "30-90 days",
            "headline": "Flip to regenerative ops",
            "milestones": [
                "Contract multimodal partners for low-carbon lanes",
                "Bundle driver rewards with sustainability OKRs",
                "Launch offset co-investment pilot",
            ],
        },
        {
            "phase": "Sprint 3",
            "horizon": "Quarter 2",
            "headline": "Scale and storytell",
            "milestones": [
                "Publish impact narrative in investor updates",
                "Open climate marketplace waitlist",
                f"Decision outcome: {decision.upper()}",
            ],
        },
    ]


@app.post("/workflow")
async def run_workflow(request: Request) -> JSONResponse:
    try:
        payload = await request.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid input, please provide distance, lat, and lon as numbers"},
        ) from exc

    distance = _parse_numeric(payload.get("distance"))
    lat = _parse_numeric(payload.get("lat"))
    lon = _parse_numeric(payload.get("lon"))

    if None in (distance, lat, lon):
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid input, please provide distance, lat, and lon as numbers"},
        )

    emissions = _estimate_emissions(distance)
    weather = _select_weather_profile(lat, lon)
    gemini_result, attempts = await _mock_gemini_loop(emissions, weather)

    if gemini_result.confidence >= CONFIDENCE_THRESHOLD:
        decision = "approve"
        result_text = gemini_result.text
    else:
        decision = "escalate"
        result_text = "Low confidence, escalate to human review"

    await _post_local_result(result_text)

    response_payload: Dict[str, Any] = {
        "forecastResult": result_text,
        "decision": decision,
        "emissions": emissions,
        "weather": weather,
        "analysisAttempts": attempts,
        "playbook": _build_playbook(distance, emissions, decision),
    }
    logger.info("Workflow complete", extra=response_payload)
    return JSONResponse(content=response_payload)


@app.get("/offset-projects")
async def list_offset_projects() -> Dict[str, List[Dict[str, Any]]]:
    return {"projects": list(MOCK_OFFSET_PROJECTS)}


@app.get("/strategy-library")
async def strategy_library() -> Dict[str, List[Dict[str, Any]]]:
    return {"strategies": list(MOCK_STRATEGY_LIBRARY)}


@app.get("/executive-snapshot")
async def executive_snapshot() -> Dict[str, Any]:
    return {"snapshot": MOCK_EXECUTIVE_SNAPSHOT}


@app.post("/api/result")
async def capture_result(payload: Dict[str, Any]) -> JSONResponse:
    result_text = str(payload.get("result", ""))
    logger.info("Result captured", extra={"result": result_text})
    return JSONResponse(content={"status": "logged"})


@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn  # type: ignore[import-untyped]

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
