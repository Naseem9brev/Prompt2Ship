export type LeaderboardEntry = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  total_commits_2026: number;
  ai_signal_commits: number;
  repos_scanned: number;
  ai_repo_config_count: number;
  ai_ratio: number;
  repo_bonus: number;
  last_scanned_at: string;
  rank?: number;
  trend?: number;
  badge?: string;
};

export type ProfileScan = LeaderboardEntry & {
  raw_score?: number;
};

export type ScanLog = {
  stage: "auth" | "repos" | "commits" | "signals" | "score" | "complete";
  message: string;
  tone?: "default" | "success" | "accent";
};
