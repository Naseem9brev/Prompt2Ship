from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


def _parse_int(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return None


@dataclass(frozen=True)
class RateLimitState:
    limit: int | None = None
    remaining: int | None = None
    reset_epoch: int | None = None
    resource: str | None = None

    @classmethod
    def from_headers(cls, headers: Mapping[str, str]) -> RateLimitState:
        lowered = {key.lower(): value for key, value in headers.items()}
        return cls(
            limit=_parse_int(lowered.get("x-ratelimit-limit")),
            remaining=_parse_int(lowered.get("x-ratelimit-remaining")),
            reset_epoch=_parse_int(lowered.get("x-ratelimit-reset")),
            resource=lowered.get("x-ratelimit-resource"),
        )

    @property
    def is_exhausted(self) -> bool:
        return self.remaining == 0


class GitHubClientError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        rate_limit: RateLimitState | None = None,
        response_body: object | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.rate_limit = rate_limit
        self.response_body = response_body


class GitHubRateLimitError(GitHubClientError):
    pass


class GitHubResponseError(GitHubClientError):
    pass


class GitHubGraphQLError(GitHubClientError):
    pass
