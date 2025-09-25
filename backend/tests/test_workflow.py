import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def test_client():
    client = TestClient(app)
    yield client


def test_workflow_happy_path_with_mocked_data(test_client):
    response = test_client.post(
        "/workflow",
        json={"distance": 1000, "lat": 40.7128, "lon": -74.0060},
    )

    assert response.status_code == 200
    payload = response.json()

    assert payload["decision"] == "approve"
    assert "Forecast" not in payload["forecastResult"].lower()
    assert "marine layer" in payload["forecastResult"].lower()
    assert pytest.approx(payload["emissions"], rel=0.01) == 690.0
    assert payload["analysisAttempts"][0]["confidence"] >= 0.7
    assert payload["analysisAttempts"][-1]["confidence"] >= 0.8


def test_workflow_invalid_payload_returns_400(test_client):
    response = test_client.post(
        "/workflow",
        json={"distance": "abc", "lat": 10, "lon": 20},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["detail"]["error"].startswith("Invalid input")


def test_workflow_escalates_when_confidence_stays_low(test_client):
    response = test_client.post(
        "/workflow",
        json={"distance": 3200, "lat": 51.5072, "lon": -0.1276},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["decision"] == "escalate"
    assert body["forecastResult"] == "Low confidence, escalate to human review"
    assert all(attempt["confidence"] < 0.8 for attempt in body["analysisAttempts"])
