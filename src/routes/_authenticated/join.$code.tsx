import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PartyPopper, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/join/$code")({
  head: () => ({
    meta: [
      { title: "Join a pot — SnapPots" },
      { name: "description", content: "Accept an invite and join a group Ajo savings pot on SnapPots." },
      { property: "og:title", content: "Join a pot — SnapPots" },
      { property: "og:description", content: "You've been invited to save together in a SnapPots group pot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPot,
});

function JoinPot() {
  const { user } = Route.useRouteContext();
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      const { data, error: rpcError } = await supabase.rpc("join_pot", { _invite_code: code });
      if (rpcError || !data) {
        setError(rpcError?.message ?? "That invite code doesn't match any pot.");
        return;
      }
      void qc.invalidateQueries();
      void navigate({ to: "/pots/$potId", params: { potId: data as string }, replace: true });
    })();
  }, [code, navigate, qc]);

  return (
    <AppShell userId={user.id}>
      <div className="mx-auto mt-16 max-w-sm rounded-3xl border border-border bg-card p-8 text-center">
        {error ? (
          <>
            <XCircle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-4 font-display text-2xl">Invite didn't work</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate({ to: "/pots" })}
              className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Go to my pots
            </button>
          </>
        ) : (
          <>
            <PartyPopper className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-4 font-display text-2xl">Joining pot {code.toUpperCase()}</h1>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Adding you to the squad…
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
