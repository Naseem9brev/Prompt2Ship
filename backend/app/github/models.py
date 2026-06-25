from __future__ import annotations

from datetime import date, datetime, timezone
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field

DEFAULT_SCAN_YEAR = 2026


class ScanStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    STUB = "stub"


class SignalWarning(BaseModel):
    source: Literal["rest", "graphql", "collector", "scoring"]
    code: str
    message: str


class RepositorySignal(BaseModel):
    name: str
    owner: str
    is_fork: bool = False
    is_archived: bool = False
    is_public: bool = True
    primary_language: str | None = None
    pushed_at: datetime | None = None
    stars: int = Field(default=0, ge=0)
    forks: int = Field(default=0, ge=0)
    ai_dependency_hits: list[str] = Field(default_factory=list)
    ai_config_hits: list[str] = Field(default_factory=list)
    prompt_asset_hits: list[str] = Field(default_factory=list)
    generated_path_hits: list[str] = Field(default_factory=list)

    @property
    def ai_marker_count(self) -> int:
        return (
            len(self.ai_dependency_hits)
            + len(self.ai_config_hits)
            + len(self.prompt_asset_hits)
            + len(self.generated_path_hits)
        )

    @property
    def has_ai_markers(self) -> bool:
        return self.ai_marker_count > 0


class CommitSignal(BaseModel):
    sha: str
    repository: str
    authored_at: date
    message: str = ""
    changed_files: int = Field(default=0, ge=0)
    additions: int = Field(default=0, ge=0)
    deletions: int = Field(default=0, ge=0)
    ai_attribution_markers: list[str] = Field(default_factory=list)
    ai_keyword_markers: list[str] = Field(default_factory=list)
    generated_path_hits: list[str] = Field(default_factory=list)
    bot_author: bool = False

    @property
    def ai_marker_count(self) -> int:
        return (
            len(self.ai_attribution_markers)
            + len(self.ai_keyword_markers)
            + len(self.generated_path_hits)
            + int(self.bot_author)
        )

    @property
    def has_ai_markers(self) -> bool:
        return self.ai_marker_count > 0


class CollectedGitHubSignals(BaseModel):
    username: str
    year: int = DEFAULT_SCAN_YEAR
    collected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    repositories: list[RepositorySignal] = Field(default_factory=list)
    commits: list[CommitSignal] = Field(default_factory=list)
    warnings: list[SignalWarning] = Field(default_factory=list)


class GitHubScanRequest(BaseModel):
    username: str = Field(min_length=1, max_length=39)
    year: int = DEFAULT_SCAN_YEAR
    include_forks: bool = False
    force_refresh: bool = False


class GitHubScanAcceptedResponse(BaseModel):
    scan_id: str
    status: ScanStatus
    username: str
    year: int
    message: str


class GitHubScanStatusResponse(BaseModel):
    scan_id: str
    status: ScanStatus
    message: str


class ScoreComponent(BaseModel):
    name: str
    points: int = Field(ge=0)
    max_points: int = Field(gt=0)
    observed: int = Field(ge=0)
    total: int = Field(ge=0)
    explanation: str


class AiAssistanceScore(BaseModel):
    username: str
    year: int
    score: int = Field(ge=0, le=100)
    confidence: Literal["low", "medium", "high"]
    components: list[ScoreComponent]
    repository_count: int = Field(ge=0)
    commit_count: int = Field(ge=0)
    warning_count: int = Field(ge=0)
