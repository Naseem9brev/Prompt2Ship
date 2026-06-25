import { LeaderboardRow } from "@/components/leaderboard-row";
import { getLeaderboard } from "@/lib/data";

export default async function LeaderboardPage() {
  const entries = await getLeaderboard(50);

  return (
    <div className="pb-16 pt-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Leaderboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">AI-assisted shipping rankings</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
          Ranked by normalized score. Users need at least 20 public 2026 commits to appear.
        </div>
      </div>
      <div className="mb-4 hidden grid-cols-[68px_1fr_132px_132px_120px] px-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground md:grid">
        <span>Rank</span>
        <span>Developer</span>
        <span className="text-right">Score</span>
        <span className="text-center">Ratio</span>
        <span className="text-right">Trend</span>
      </div>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <LeaderboardRow key={entry.user_id} entry={entry} rank={entry.rank ?? index + 1} />
        ))}
      </div>
    </div>
  );
}
