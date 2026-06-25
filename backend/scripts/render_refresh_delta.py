from __future__ import annotations

import json
from os import environ
from sys import exit as sys_exit
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen


def required_env(name: str) -> str:
    value = environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def delta_days() -> int:
    raw_value = environ.get("SCAN_DELTA_DAYS", "3").strip()
    try:
        days = int(raw_value)
    except ValueError as exc:
        raise RuntimeError("SCAN_DELTA_DAYS must be an integer") from exc
    if days < 1:
        raise RuntimeError("SCAN_DELTA_DAYS must be at least 1")
    return days


def refresh_url(base_url: str, days: int) -> str:
    parsed = urlsplit(base_url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query["days"] = str(days)
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))


def run() -> None:
    days = delta_days()
    url = refresh_url(required_env("REFRESH_CRON_URL"), days)
    secret = required_env("REFRESH_CRON_SECRET")
    payload = json.dumps({"delta_days": days}).encode("utf-8")
    request = Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
            "User-Agent": "prompt2ship-render-cron/1.0",
            "X-Refresh-Cron-Secret": secret,
        },
    )
    with urlopen(request, timeout=60) as response:
        print(f"refresh_delta status={response.status} days={days}")


if __name__ == "__main__":
    try:
        run()
    except HTTPError as exc:
        print(f"refresh_delta failed status={exc.code}", flush=True)
        sys_exit(1)
    except (RuntimeError, URLError, TimeoutError) as exc:
        print(f"refresh_delta failed: {exc}", flush=True)
        sys_exit(1)
