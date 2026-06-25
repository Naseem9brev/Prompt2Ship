"use client";

import { useState } from "react";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function ConnectGitHubButton({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const [loading, setLoading] = useState(false);

  async function connect() {
    if (!hasSupabaseEnv) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/scan`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user public_repo"
      }
    });

    if (error) {
      setLoading(false);
      throw error;
    }
  }

  return (
    <Button size={size} onClick={connect} disabled={loading} className="gap-2" title={hasSupabaseEnv ? undefined : "Supabase env vars are needed to enable OAuth"}>
      <GitBranch className="h-4 w-4" />
      {loading ? "Opening GitHub…" : "Connect GitHub"}
    </Button>
  );
}
