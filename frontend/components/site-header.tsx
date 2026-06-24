import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="font-mono text-lg tracking-tight text-foreground terminal-caret">
        <span className="font-light">prompted</span>
        <span className="font-bold text-primary">AndShipped</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="ghost" size="sm">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/scan" className="gap-2">
            <GitBranch className="h-4 w-4" /> Connect GitHub
          </Link>
        </Button>
      </nav>
    </header>
  );
}
