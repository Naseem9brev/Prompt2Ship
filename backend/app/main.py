from os import getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

SERVICE_NAME = "prompt2ship-api"
VERSION = "0.1.0"


def _cors_origins() -> list[str]:
    configured = getenv("CORS_ORIGINS") or getenv("FRONTEND_ORIGIN") or "http://localhost:3000"
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


app = FastAPI(
    title="Prompt2Ship API",
    description="FastAPI backend for GitHub scan orchestration and scoring.",
    version=VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok"}


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"service": SERVICE_NAME, "status": "ok", "version": VERSION}


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return healthz()
