import Link from "next/link";
import { Terminal, Trophy } from "lucide-react";
import { ConnectGitHubButton } from "@/components/connect-github-button";
import { HeroDashboard } from "@/components/hero-dashboard";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { Button } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/data";

export default async function Home() {
  const entries = await getLeaderboard(5);

  return (
    <div className="pb-16 pt-8">
      <section className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            <Terminal className="h-3.5 w-3.5" /> 2026 commit history scanner
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-foreground md:text-7xl">
            How much of your code did you actually write?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Connect GitHub, scan your public 2026 commits, and get a shareable AI-assist score built from commit trailers, tool fingerprints, repo config, and shipping volume.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ConnectGitHubButton />
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4" /> View leaderboard
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["Scope", "Public only"],
              ["Year", "2026"],
              ["Minimum", "20 commits"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-card/65 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-sm font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <HeroDashboard entries={entries} />
      </section>
      <div className="mt-16">
        <LeaderboardPreview entries={entries} />
      </div>
    </div>
  );
}
