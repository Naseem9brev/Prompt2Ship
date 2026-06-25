import { Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileScan } from "@/lib/types";
import { formatPercent, formatScore } from "@/lib/utils";

export function ScoreCard({ profile }: { profile: ProfileScan }) {
  const stats = [
    ["AI ratio", formatPercent(profile.ai_ratio)],
    ["Volume", profile.total_commits_2026.toLocaleString()],
    ["Repo bonus", `${Math.round(profile.repo_bonus * 100)} pts`],
    ["AI repos", `${profile.ai_repo_config_count}/${profile.repos_scanned}`]
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card/80 p-6 shadow-glow backdrop-blur">
      <div className="scan-line absolute top-0 h-full w-1/3 opacity-70" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-assist score
          </div>
          <div className="mt-5 font-mono text-8xl font-black leading-none text-primary md:text-9xl">
            {formatScore(profile.score)}
          </div>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {profile.username} looks {profile.score > 80 ? "dangerously prompted" : "part-human, part-machine"} across public 2026 GitHub history.
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Share2 className="h-4 w-4" /> Share flex stat
        </Button>
      </div>
      <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
