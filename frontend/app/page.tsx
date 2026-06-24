const productSteps = [
  "Connect GitHub with Supabase Auth",
  "Scan public 2026 commits and repo signals",
  "Compute an AI-assist score",
  "Share a profile and climb the leaderboard"
];

const upcomingSlices = ["GitHub OAuth", "Scan engine", "SSE progress", "Leaderboard", "Profile pages"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#182037_0%,#05070d_48%,#02030a_100%)] px-6 py-10 text-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-16">
        <nav className="flex items-center justify-between text-sm text-slate-400">
          <span className="font-semibold uppercase tracking-[0.4em] text-cyan">Prompt2Ship</span>
          <span>Phase 1 foundation</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 shadow-2xl shadow-electric/10">
              How much of your code did you actually write?
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
                Turn your 2026 GitHub history into an AI-assist flex stat.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Prompt2Ship will connect GitHub, scan public commit and repository signals, and publish a shareable score with a public leaderboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-white px-6 py-3 font-semibold text-graphite shadow-xl shadow-cyan/10" type="button">
                Connect GitHub soon
              </button>
              <a className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white" href="/api-status">
                View build status
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-electric/20 backdrop-blur">
            <div className="rounded-[1.5rem] bg-graphite p-6 ring-1 ring-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan">Score preview</p>
              <div className="mt-6 text-7xl font-black text-white">0.00</div>
              <p className="mt-2 text-slate-400">Awaiting authenticated scan data</p>
              <div className="mt-8 space-y-4">
                {productSteps.map((step, index) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4" key={step}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-graphite">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-200">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-bold text-white">Next feature PRs</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {upcomingSlices.map((slice) => (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300" key={slice}>
                {slice}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
