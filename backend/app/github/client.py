from __future__ import annotations

from datetime import date
from typing import Mapping, Protocol, Sequence

from app.github.errors import (
    GitHubGraphQLError,
    GitHubRateLimitError,
    GitHubResponseError,
    RateLimitState,
)

GITHUB_API_BASE_URL = "https://api.github.com"
GITHUB_API_VERSION = "2022-11-28"


class HttpResponse(Protocol):
    status_code: int
    headers: Mapping[str, str]

    def json(self) -> object:
        raise NotImplementedError


class AsyncHttpTransport(Protocol):
    async def get(
        self,
        url: str,
        *,
        headers: Mapping[str, str],
        params: Mapping[str, str | int] | None = None,
    ) -> HttpResponse:
        raise NotImplementedError

    async def post(
        self,
        url: str,
        *,
        headers: Mapping[str, str],
        json: Mapping[str, object],
    ) -> HttpResponse:
        raise NotImplementedError


def _headers(token: str | None) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        "User-Agent": "prompt2ship-backend",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _raise_for_response(response: HttpResponse) -> object:
    payload = response.json()
    rate_limit = RateLimitState.from_headers(response.headers)
    if response.status_code in {403, 429} and rate_limit.is_exhausted:
        raise GitHubRateLimitError(
            "GitHub API rate limit exhausted",
            status_code=response.status_code,
            rate_limit=rate_limit,
            response_body=payload,
        )
    if response.status_code >= 400:
        raise GitHubResponseError(
            "GitHub API request failed",
            status_code=response.status_code,
            rate_limit=rate_limit,
            response_body=payload,
        )
    return payload


def _expect_mapping(payload: object) -> Mapping[str, object]:
    if not isinstance(payload, dict):
        raise GitHubResponseError("GitHub API returned a non-object response")
    return payload


def _expect_list_of_mappings(payload: object) -> Sequence[Mapping[str, object]]:
    if not isinstance(payload, list):
        raise GitHubResponseError("GitHub API returned a non-list response")
    for item in payload:
        if not isinstance(item, dict):
            raise GitHubResponseError("GitHub API returned a list with non-object entries")
    return payload


class GitHubRestClient:
    def __init__(
        self,
        transport: AsyncHttpTransport,
        *,
        token: str | None = None,
        base_url: str = GITHUB_API_BASE_URL,
    ) -> None:
        self._transport = transport
        self._token = token
        self._base_url = base_url.rstrip("/")

    async def list_user_repositories(
        self, username: str, *, page: int = 1, per_page: int = 100
    ) -> Sequence[Mapping[str, object]]:
        response = await self._transport.get(
            f"{self._base_url}/users/{username}/repos",
            headers=_headers(self._token),
            params={
                "type": "owner",
                "sort": "pushed",
                "direction": "desc",
                "page": page,
                "per_page": per_page,
            },
        )
        return _expect_list_of_mappings(_raise_for_response(response))

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
        response = await self._transport.get(
            f"{self._base_url}/repos/{owner}/{repository}/commits",
            headers=_headers(self._token),
            params={
                "since": since.isoformat(),
                "until": until.isoformat(),
                "page": page,
                "per_page": per_page,
            },
        )
        return _expect_list_of_mappings(_raise_for_response(response))

    async def get_repository_languages(self, owner: str, repository: str) -> Mapping[str, object]:
        response = await self._transport.get(
            f"{self._base_url}/repos/{owner}/{repository}/languages",
            headers=_headers(self._token),
            params=None,
        )
        return _expect_mapping(_raise_for_response(response))

    async def get_repository_contents(
        self, owner: str, repository: str, *, path: str = "", ref: str | None = None
    ) -> object:
        params: dict[str, str] | None = {"ref": ref} if ref else None
        response = await self._transport.get(
            f"{self._base_url}/repos/{owner}/{repository}/contents/{path}",
            headers=_headers(self._token),
            params=params,
        )
        return _raise_for_response(response)


class GitHubGraphQLClient:
    def __init__(
        self,
        transport: AsyncHttpTransport,
        *,
        token: str | None = None,
        base_url: str = GITHUB_API_BASE_URL,
    ) -> None:
        self._transport = transport
        self._token = token
        self._base_url = base_url.rstrip("/")

    async def execute(
        self, query: str, variables: Mapping[str, object] | None = None
    ) -> Mapping[str, object]:
        response = await self._transport.post(
            f"{self._base_url}/graphql",
            headers=_headers(self._token),
            json={"query": query, "variables": dict(variables or {})},
        )
        payload = _expect_mapping(_raise_for_response(response))
        errors = payload.get("errors")
        if errors:
            raise GitHubGraphQLError("GitHub GraphQL response contained errors", response_body=payload)
        return payload
