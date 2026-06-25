import { LeaderboardRow } from "@/components/leaderboard-row";
import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardPreview({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="rounded-[2rem] border border-border bg-background/70 p-4 shadow-card backdrop-blur md:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Public leaderboard</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Most suspiciously shipped</h2>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-muted-foreground sm:block">
          Minimum 20 public commits in 2026. Private repos stay private.
        </p>
      </div>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <LeaderboardRow key={entry.user_id} entry={entry} rank={entry.rank ?? index + 1} />
        ))}
      </div>
    </section>
  );
}
