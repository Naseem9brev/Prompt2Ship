import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { LeaderboardEntry } from "@/lib/types";
import { cn, formatPercent, formatScore } from "@/lib/utils";

const medalStyles: Record<number, string> = {
  1: "border-gold/50 bg-gold/10 text-gold shadow-[0_0_28px_hsl(var(--gold)/0.14)]",
  2: "border-silver/50 bg-silver/10 text-silver",
  3: "border-bronze/50 bg-bronze/10 text-bronze"
};

export function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const TrendIcon = (entry.trend ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Link
      href={`/u/${entry.username}`}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border bg-card/70 p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 md:grid-cols-[68px_1fr_132px_132px_120px]"
    >
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-sm", medalStyles[rank] ?? "border-border bg-muted text-muted-foreground")}>
        #{rank}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar username={entry.username} src={entry.avatar_url} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{entry.username}</p>
          <p className="font-mono text-xs text-muted-foreground">{entry.badge ?? "Vibe checked"}</p>
        </div>
      </div>
      <div className="text-right font-mono text-3xl font-black text-primary">{formatScore(entry.score)}</div>
      <div className="hidden rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-center font-mono text-xs text-cyan md:block">
        {formatPercent(entry.ai_ratio)} AI ratio
      </div>
      <div className="hidden items-center justify-end gap-1 text-sm text-muted-foreground md:flex">
        <TrendIcon className={cn("h-4 w-4", (entry.trend ?? 0) >= 0 ? "text-primary" : "text-red-300")} />
        {Math.abs(entry.trend ?? 0)} from last scan
      </div>
    </Link>
  );
}
