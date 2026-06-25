from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_healthz_returns_service_status() -> None:
    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {
        "service": "prompt2ship-api",
        "status": "ok",
        "version": "0.1.0",
    }


def test_root_returns_ok_status() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
