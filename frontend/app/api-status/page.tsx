const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ApiStatusPage() {
  return (
    <main className="min-h-screen bg-graphite px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan">Build status</p>
        <h1 className="mt-4 text-4xl font-black text-white">Foundation scaffold is wired.</h1>
        <p className="mt-4 text-slate-300">
          The frontend is configured to call the FastAPI service at <code className="text-cyan">{apiUrl}</code>.
        </p>
        <p className="mt-4 text-slate-400">
          Auth, scanning, persistence, and leaderboard features will land in focused follow-up PRs.
        </p>
      </section>
    </main>
  );
}
