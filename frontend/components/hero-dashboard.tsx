import { Activity, BarChart3, Search, Settings2, Trophy } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { LeaderboardEntry } from "@/lib/types";
import { formatPercent, formatScore } from "@/lib/utils";

const navItems = [Trophy, Search, Activity, BarChart3, Settings2];

export function HeroDashboard({ entries }: { entries: LeaderboardEntry[] }) {
  const topThree = entries.slice(0, 3);
  const leader = topThree[0];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-card backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="grid min-h-[560px] grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr_360px]">
        <aside className="flex flex-col items-center justify-between border-r border-border bg-background/60 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-mono text-xl font-black text-primary-foreground">
            S
          </div>
          <div className="flex flex-col gap-4">
            {navItems.map((Icon, index) => (
              <div
                key={index}
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${index === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
          <div className="h-9 w-9 rounded-full border border-primary/30 bg-primary/10" />
        </aside>

        <section className="min-w-0 border-r border-border/70">
          <div className="flex flex-col gap-3 border-b border-border bg-background/45 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">Leaderboard</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">All developers · Compare</h2>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <div className="rounded-lg border border-border bg-card px-3 py-2">Search</div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-primary">2026</div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-cyan/15 to-background p-6">
            <div className="scan-line absolute inset-y-0 w-1/2" />
            <div className="relative grid h-48 grid-cols-3 items-end gap-3">
              {topThree.map((entry, index) => {
                const heights = ["h-24", "h-36", "h-20"];
                const order = index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3";
                const rank = index === 0 ? 1 : index === 1 ? 2 : 3;

                return (
                  <div key={entry.user_id} className={`${order} flex flex-col items-center`}>
                    <Avatar username={entry.username} src={entry.avatar_url} size={52} />
                    <p className="mt-3 max-w-[120px] truncate text-sm font-bold">{entry.username}</p>
                    <p className="font-mono text-xs text-muted-foreground">Level {Math.ceil(entry.score / 25)}</p>
                    <div className={`mt-3 flex w-full max-w-[118px] items-end justify-center rounded-t-xl border border-primary/20 bg-background/35 ${heights[index]}`}>
                      <span className="pb-4 font-mono text-3xl font-black text-foreground">{rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-border/70 bg-background/35">
            {entries.slice(0, 5).map((entry, index) => (
              <div key={entry.user_id} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 px-5 py-4">
                <div className="font-mono text-sm text-muted-foreground">{index + 1}</div>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar username={entry.username} src={entry.avatar_url} size={34} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{entry.username}</p>
                    <p className="font-mono text-xs text-muted-foreground">{formatPercent(entry.ai_ratio)} AI · {entry.total_commits_2026} commits</p>
                  </div>
                </div>
                <p className="font-mono text-lg font-black text-primary">{formatScore(entry.score)}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="hidden bg-background/50 p-6 lg:block">
          {leader ? (
            <div>
              <div className="flex items-center gap-4">
                <Avatar username={leader.username} src={leader.avatar_url} size={76} />
                <div>
                  <p className="font-bold">{leader.username}</p>
                  <p className="font-mono text-xs text-muted-foreground">Level {Math.ceil(leader.score / 25)}</p>
                  <p className="mt-2 font-mono text-4xl font-black text-primary">{formatScore(leader.score)}</p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="font-bold">Achiever in other categories</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Best Prompt", "Repo Aura", "Ship Velocity"].map((badge) => (
                    <span key={badge} className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="font-bold">Achievements</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["AI ratio", "Volume", "Repo bonus", "Consistency"].map((item, index) => (
                    <div key={item} className="rounded-2xl border border-border bg-card/80 p-4">
                      <p className="font-mono text-2xl font-black text-primary">0{index + 1}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>Level 4</span>
                  <span>87% completed</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-muted">
                  <div className="h-3 w-[87%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
