from __future__ import annotations

from datetime import date
from typing import Mapping, Protocol, Sequence

from pydantic import BaseModel, Field

from app.github.models import CollectedGitHubSignals, DEFAULT_SCAN_YEAR, GitHubScanRequest


class GitHubRestClientInterface(Protocol):
    async def list_user_repositories(
        self, username: str, *, page: int = 1, per_page: int = 100
    ) -> Sequence[Mapping[str, object]]:
        raise NotImplementedError

    async def list_repository_commits(
        self,
        owner: str,
        repository: str,
        *,
        since: date,
        until: date,
        page: int = 1,
        per_page: int = 100,
    ) -> Sequence[Mapping[str, object]]:
        raise NotImplementedError

    async def get_repository_languages(self, owner: str, repository: str) -> Mapping[str, object]:
        raise NotImplementedError

    async def get_repository_contents(
        self, owner: str, repository: str, *, path: str = "", ref: str | None = None
    ) -> object:
        raise NotImplementedError


class GitHubGraphQLClientInterface(Protocol):
    async def execute(
        self, query: str, variables: Mapping[str, object] | None = None
    ) -> Mapping[str, object]:
        raise NotImplementedError


class PublicGitHubSignalCollector(Protocol):
    async def collect_public_signals(self, request: GitHubScanRequest) -> CollectedGitHubSignals:
        raise NotImplementedError


class PublicSignalCollectionPlan(BaseModel):
    username: str
    year: int = DEFAULT_SCAN_YEAR
    start_date: date
    end_date: date
    rest_endpoints: list[str] = Field(default_factory=list)
    graphql_queries: list[str] = Field(default_factory=list)
    emitted_signal_types: list[str] = Field(default_factory=list)


def build_2026_public_signal_plan(username: str) -> PublicSignalCollectionPlan:
    return PublicSignalCollectionPlan(
        username=username,
        start_date=date(DEFAULT_SCAN_YEAR, 1, 1),
        end_date=date(DEFAULT_SCAN_YEAR, 12, 31),
        rest_endpoints=[
            "GET /users/{username}/repos",
            "GET /repos/{owner}/{repo}/commits",
            "GET /repos/{owner}/{repo}/languages",
            "GET /repos/{owner}/{repo}/contents/{path}",
        ],
        graphql_queries=[
            "Repository defaultBranchRef history for 2026 commit metadata",
            "Repository object tree sampling for AI config/dependency markers",
        ],
        emitted_signal_types=[
            "RepositorySignal",
            "CommitSignal",
            "SignalWarning",
        ],
    )
