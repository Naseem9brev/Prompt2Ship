import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { ScoreCard } from "@/components/score-card";
import { getProfile } from "@/lib/data";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="pb-16 pt-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar username={profile.username} src={profile.avatar_url} size={64} />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Profile</p>
          <h1 className="text-3xl font-black tracking-tight">{profile.username}</h1>
        </div>
      </div>
      <ScoreCard profile={profile} />
      <section className="mt-6 rounded-[2rem] border border-border bg-card/70 p-6 shadow-card">
        <h2 className="text-xl font-bold">Signal breakdown</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <p className="font-mono text-3xl font-bold text-primary">{profile.ai_signal_commits}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              commits with AI-like trailers or generated-message fingerprints
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <p className="font-mono text-3xl font-bold text-cyan">{profile.ai_repo_config_count}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              repos with Cursor, Claude, Copilot, Devin, or README AI-tool signals
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-5">
            <p className="font-mono text-3xl font-bold text-foreground">{profile.repos_scanned}</p>
            <p className="mt-1 text-sm text-muted-foreground">public repos with qualifying 2026 commits scanned</p>
          </div>
        </div>
      </section>
    </div>
  );
}
