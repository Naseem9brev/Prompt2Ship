from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import date
from typing import Mapping

import pytest

from app.github.client import GitHubGraphQLClient, GitHubRestClient
from app.github.errors import GitHubGraphQLError, GitHubRateLimitError


@dataclass(frozen=True)
class FakeResponse:
    status_code: int
    payload: object
    headers: Mapping[str, str] = field(default_factory=dict)

    def json(self) -> object:
        return self.payload


@dataclass(frozen=True)
class RecordedRequest:
    method: str
    url: str
    headers: Mapping[str, str]
    params: Mapping[str, str | int] | None = None
    json_payload: Mapping[str, object] | None = None


class FakeTransport:
    def __init__(self, responses: list[FakeResponse]) -> None:
        self.responses = responses
        self.requests: list[RecordedRequest] = []

    async def get(
        self,
        url: str,
        *,
        headers: Mapping[str, str],
        params: Mapping[str, str | int] | None = None,
    ) -> FakeResponse:
        self.requests.append(RecordedRequest("GET", url, headers, params=params))
        return self.responses.pop(0)

    async def post(
        self,
        url: str,
        *,
        headers: Mapping[str, str],
        json: Mapping[str, object],
    ) -> FakeResponse:
        self.requests.append(RecordedRequest("POST", url, headers, json_payload=json))
        return self.responses.pop(0)


def test_rest_client_lists_public_repositories_with_versioned_headers() -> None:
    transport = FakeTransport(
        [FakeResponse(200, [{"name": "Prompt2Ship", "private": False}])]
    )
    client = GitHubRestClient(transport, token="token", base_url="https://github.test")

    repositories = asyncio.run(client.list_user_repositories("Naseem9brev"))

    assert repositories[0]["name"] == "Prompt2Ship"
    request = transport.requests[0]
    assert request.url == "https://github.test/users/Naseem9brev/repos"
    assert request.headers["Authorization"] == "Bearer token"
    assert request.headers["X-GitHub-Api-Version"] == "2022-11-28"
    assert request.params == {
        "type": "owner",
        "sort": "pushed",
        "direction": "desc",
        "page": 1,
        "per_page": 100,
    }


def test_rest_client_uses_2026_commit_window_parameters() -> None:
    transport = FakeTransport([FakeResponse(200, [{"sha": "abc123"}])])
    client = GitHubRestClient(transport, base_url="https://github.test")

    commits = asyncio.run(
        client.list_repository_commits(
            "Naseem9brev",
            "Prompt2Ship",
            since=date(2026, 1, 1),
            until=date(2026, 12, 31),
        )
    )

    assert commits[0]["sha"] == "abc123"
    assert transport.requests[0].url == "https://github.test/repos/Naseem9brev/Prompt2Ship/commits"
    assert transport.requests[0].params == {
        "since": "2026-01-01",
        "until": "2026-12-31",
        "page": 1,
        "per_page": 100,
    }


def test_rest_client_raises_rate_limit_error_with_header_state() -> None:
    transport = FakeTransport(
        [
            FakeResponse(
                403,
                {"message": "API rate limit exceeded"},
                headers={
                    "x-ratelimit-limit": "60",
                    "x-ratelimit-remaining": "0",
                    "x-ratelimit-reset": "1780000000",
                    "x-ratelimit-resource": "core",
                },
            )
        ]
    )
    client = GitHubRestClient(transport)

    with pytest.raises(GitHubRateLimitError) as error:
        asyncio.run(client.get_repository_languages("Naseem9brev", "Prompt2Ship"))

    assert error.value.status_code == 403
    assert error.value.rate_limit is not None
    assert error.value.rate_limit.remaining == 0
    assert error.value.rate_limit.resource == "core"


def test_graphql_client_posts_query_and_surfaces_graphql_errors() -> None:
    transport = FakeTransport(
        [FakeResponse(200, {"data": None, "errors": [{"message": "bad query"}]})]
    )
    client = GitHubGraphQLClient(transport, base_url="https://github.test")

    with pytest.raises(GitHubGraphQLError):
        asyncio.run(client.execute("query Repo($owner: String!) { viewer { login } }", {"owner": "n"}))

    request = transport.requests[0]
    assert request.url == "https://github.test/graphql"
    assert request.json_payload == {
        "query": "query Repo($owner: String!) { viewer { login } }",
        "variables": {"owner": "n"},
    }
