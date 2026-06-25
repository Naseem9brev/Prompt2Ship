from datetime import date

from app.github.contracts import build_2026_public_signal_plan
from app.github.models import DEFAULT_SCAN_YEAR, GitHubScanRequest


def test_public_signal_plan_is_pinned_to_2026_public_commit_and_repo_contracts() -> None:
    plan = build_2026_public_signal_plan("Naseem9brev")

    assert plan.username == "Naseem9brev"
    assert plan.year == DEFAULT_SCAN_YEAR
    assert plan.start_date == date(2026, 1, 1)
    assert plan.end_date == date(2026, 12, 31)
    assert "GET /users/{username}/repos" in plan.rest_endpoints
    assert "GET /repos/{owner}/{repo}/commits" in plan.rest_endpoints
    assert "RepositorySignal" in plan.emitted_signal_types
    assert "CommitSignal" in plan.emitted_signal_types


def test_scan_request_defaults_to_2026_without_auth_or_storage_fields() -> None:
    request = GitHubScanRequest(username="Naseem9brev")

    assert request.year == 2026
    assert request.include_forks is False
    assert request.force_refresh is False
