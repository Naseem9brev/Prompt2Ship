"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Terminal } from "lucide-react";
import { ConnectGitHubButton } from "@/components/connect-github-button";
import { Button } from "@/components/ui/button";
import { scanLogs } from "@/lib/mock-data";

export function ScanClient() {
  const [running, setRunning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const complete = running && visibleCount >= scanLogs.length;
  const scanning = running && !complete;
  const visibleLogs = useMemo(() => scanLogs.slice(0, visibleCount), [visibleCount]);

  useEffect(() => {
    if (!scanning) {
      return;
    }

    const timer = window.setTimeout(() => setVisibleCount((count) => count + 1), 650);
    return () => window.clearTimeout(timer);
  }, [scanning, visibleCount]);

  function startDemo() {
    setVisibleCount(0);
    setRunning(true);
  }

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Scan console</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Preview the GitHub scan flow</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            UI state for the OAuth-to-score loop. The production backend can replace this demo stream with SSE events.
          </p>
        </div>
        <Terminal className="h-8 w-8 text-primary" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={startDemo} disabled={scanning} size="lg">
          {scanning ? "Scanning…" : "Run UI demo"}
        </Button>
        <ConnectGitHubButton size="lg" />
      </div>
      <div className="mt-6 min-h-80 overflow-hidden rounded-2xl border border-border bg-background/80 p-4 font-mono text-sm">
        {visibleLogs.length === 0 ? <p className="text-muted-foreground">$ waiting for github oauth…</p> : null}
        {visibleLogs.map((event) => (
          <p key={event.stage} className={event.tone === "success" ? "text-primary" : event.tone === "accent" ? "text-cyan" : "text-muted-foreground"}>
            <span className="text-foreground">[{event.stage}]</span> {event.message}
          </p>
        ))}
      </div>
      {complete && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Score card state is ready.
          </span>
          <Link href="/u/devin-operator" className="font-semibold underline underline-offset-4">View sample profile</Link>
        </div>
      )}
    </section>
  );
}
