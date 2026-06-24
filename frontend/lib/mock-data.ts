import type { LeaderboardEntry, ScanLog } from "@/lib/types";

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    user_id: "mock-1",
    username: "devin-operator",
    avatar_url: null,
    score: 94,
    total_commits_2026: 248,
    ai_signal_commits: 181,
    repos_scanned: 18,
    ai_repo_config_count: 11,
    ai_ratio: 0.73,
    repo_bonus: 0.12,
    last_scanned_at: new Date().toISOString(),
    rank: 1,
    trend: 5,
    badge: "Devin Maxed"
  },
  {
    user_id: "mock-2",
    username: "cursor-cowboy",
    avatar_url: null,
    score: 88,
    total_commits_2026: 192,
    ai_signal_commits: 124,
    repos_scanned: 12,
    ai_repo_config_count: 7,
    ai_ratio: 0.65,
    repo_bonus: 0.12,
    last_scanned_at: new Date().toISOString(),
    rank: 2,
    trend: 2,
    badge: "Cursor Aura"
  },
  {
    user_id: "mock-3",
    username: "claude-committer",
    avatar_url: null,
    score: 82,
    total_commits_2026: 151,
    ai_signal_commits: 91,
    repos_scanned: 10,
    ai_repo_config_count: 5,
    ai_ratio: 0.6,
    repo_bonus: 0.1,
    last_scanned_at: new Date().toISOString(),
    rank: 3,
    trend: 7,
    badge: "Prompt Royalty"
  },
  {
    user_id: "mock-4",
    username: "manual-mode",
    avatar_url: null,
    score: 61,
    total_commits_2026: 91,
    ai_signal_commits: 34,
    repos_scanned: 8,
    ai_repo_config_count: 2,
    ai_ratio: 0.37,
    repo_bonus: 0.05,
    last_scanned_at: new Date().toISOString(),
    rank: 4,
    trend: -3,
    badge: "Still Typing"
  },
  {
    user_id: "mock-5",
    username: "copilot-pilled",
    avatar_url: null,
    score: 57,
    total_commits_2026: 76,
    ai_signal_commits: 29,
    repos_scanned: 6,
    ai_repo_config_count: 2,
    ai_ratio: 0.38,
    repo_bonus: 0.07,
    last_scanned_at: new Date().toISOString(),
    rank: 5,
    trend: 1,
    badge: "Autocomplete Enjoyer"
  }
];

export const scanLogs: ScanLog[] = [
  { stage: "auth", message: "GitHub OAuth handshake ready", tone: "success" },
  { stage: "repos", message: "Found public 2026 repositories", tone: "accent" },
  { stage: "commits", message: "Scanning commit trailers and message fingerprints" },
  { stage: "signals", message: "Checking .cursor, CLAUDE.md, .devin, Copilot instructions" },
  { stage: "score", message: "Normalizing AI ratio × repo bonus × volume" },
  { stage: "complete", message: "Score card ready to flex", tone: "success" }
];

