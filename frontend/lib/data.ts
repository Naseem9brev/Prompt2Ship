import { mockLeaderboard } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry, ProfileScan } from "@/lib/types";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getLeaderboard(limit = 10, offset = 0): Promise<LeaderboardEntry[]> {
  if (!hasSupabaseEnv()) {
    return mockLeaderboard.slice(offset, offset + limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .gte("total_commits_2026", 20)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return mockLeaderboard.slice(offset, offset + limit);
  }

  return data.map((entry, index) => ({ ...entry, rank: offset + index + 1 })) as LeaderboardEntry[];
}

export async function getProfile(username: string): Promise<ProfileScan | null> {
  if (!hasSupabaseEnv()) {
    return mockLeaderboard.find((entry) => entry.username === username) ?? mockLeaderboard[0] ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("public_profiles").select("*").eq("username", username).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ProfileScan;
}
