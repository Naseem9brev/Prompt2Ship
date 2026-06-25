from __future__ import annotations

from app.github.models import (
    AiAssistanceScore,
    CollectedGitHubSignals,
    CommitSignal,
    RepositorySignal,
    ScoreComponent,
)


def _ratio(observed: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return max(0.0, min(1.0, observed / total))


def _points(max_points: int, observed: int, total: int) -> int:
    return int((max_points * _ratio(observed, total)) + 0.5)


def _commit_has_generated_paths(commit: CommitSignal) -> bool:
    return len(commit.generated_path_hits) > 0


def _repository_has_dependency_or_config_hits(repository: RepositorySignal) -> bool:
    return len(repository.ai_dependency_hits) > 0 or len(repository.ai_config_hits) > 0


def _confidence(repository_count: int, commit_count: int) -> str:
    coverage = min(100, (repository_count * 8) + (commit_count * 2))
    if coverage >= 70:
        return "high"
    if coverage >= 30:
        return "medium"
    return "low"


class DeterministicScoreCalculator:
    def calculate(self, signals: CollectedGitHubSignals) -> AiAssistanceScore:
        repositories = [repository for repository in signals.repositories if repository.is_public]
        commits = [
            commit for commit in signals.commits if commit.authored_at.year == signals.year
        ]

        commit_marker_count = sum(1 for commit in commits if commit.has_ai_markers)
        generated_commit_count = sum(1 for commit in commits if _commit_has_generated_paths(commit))
        repo_marker_count = sum(1 for repository in repositories if repository.has_ai_markers)
        repo_tool_count = sum(
            1 for repository in repositories if _repository_has_dependency_or_config_hits(repository)
        )

        components = [
            ScoreComponent(
                name="commit_ai_markers",
                points=_points(40, commit_marker_count, len(commits)),
                max_points=40,
                observed=commit_marker_count,
                total=len(commits),
                explanation="2026 commits with public AI attribution or keyword markers.",
            ),
            ScoreComponent(
                name="generated_code_surface",
                points=_points(20, generated_commit_count, len(commits)),
                max_points=20,
                observed=generated_commit_count,
                total=len(commits),
                explanation="2026 commits touching generated-code path markers.",
            ),
            ScoreComponent(
                name="repository_ai_markers",
                points=_points(30, repo_marker_count, len(repositories)),
                max_points=30,
                observed=repo_marker_count,
                total=len(repositories),
                explanation="Public repositories exposing AI dependencies, config, prompts, or generated paths.",
            ),
            ScoreComponent(
                name="tooling_depth",
                points=_points(10, repo_tool_count, min(len(repositories), 5)),
                max_points=10,
                observed=repo_tool_count,
                total=min(len(repositories), 5),
                explanation="Breadth of public repositories with AI dependency/config markers.",
            ),
        ]
        score = min(100, sum(component.points for component in components))

        return AiAssistanceScore(
            username=signals.username,
            year=signals.year,
            score=score,
            confidence=_confidence(len(repositories), len(commits)),
            components=components,
            repository_count=len(repositories),
            commit_count=len(commits),
            warning_count=len(signals.warnings),
        )
