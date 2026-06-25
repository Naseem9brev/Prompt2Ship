from __future__ import annotations

from hashlib import sha256

from fastapi import APIRouter, status

from app.github.contracts import PublicSignalCollectionPlan, build_2026_public_signal_plan
from app.github.models import (
    AiAssistanceScore,
    CollectedGitHubSignals,
    GitHubScanAcceptedResponse,
    GitHubScanRequest,
    GitHubScanStatusResponse,
    ScanStatus,
)
from app.github.scoring import DeterministicScoreCalculator

router = APIRouter(prefix="/api/github", tags=["github"])


def _stub_scan_id(request: GitHubScanRequest) -> str:
    digest = sha256(
        f"{request.username.lower()}:{request.year}:{request.include_forks}".encode()
    ).hexdigest()[:16]
    return f"stub-{digest}"


@router.get("/scan-contract", response_model=PublicSignalCollectionPlan)
def get_scan_contract(username: str = "octocat") -> PublicSignalCollectionPlan:
    return build_2026_public_signal_plan(username)


@router.post(
    "/scans",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=GitHubScanAcceptedResponse,
)
def queue_github_scan(request: GitHubScanRequest) -> GitHubScanAcceptedResponse:
    return GitHubScanAcceptedResponse(
        scan_id=_stub_scan_id(request),
        status=ScanStatus.QUEUED,
        username=request.username,
        year=request.year,
        message="GitHub scan endpoint stub accepted the request; auth/storage/SSE wiring is pending.",
    )


@router.get("/scans/{scan_id}", response_model=GitHubScanStatusResponse)
def get_github_scan_status(scan_id: str) -> GitHubScanStatusResponse:
    return GitHubScanStatusResponse(
        scan_id=scan_id,
        status=ScanStatus.STUB,
        message="Scan status endpoint stub is ready for future storage-backed progress updates.",
    )


@router.post("/scores/preview", response_model=AiAssistanceScore)
def preview_ai_assistance_score(signals: CollectedGitHubSignals) -> AiAssistanceScore:
    return DeterministicScoreCalculator().calculate(signals)
