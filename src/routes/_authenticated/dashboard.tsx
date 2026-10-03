import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Plus, ShieldAlert, Target, TrendingUp, Wallet, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { QuickSaveSheet } from "@/components/quick-save-sheet";
import { ClientOnly } from "@/components/client-only";
import Antigravity from "@/components/antigravity";
import { useCurrency } from "@/lib/currency";
import { POT_META, potProgress, usePots, useProfile, useWallet, type PotType } from "@/lib/pots";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — SnapPots" },
      { name: "description", content: "Your SnapPots home: streak, wallet balance, pot progress and one-tap top-ups." },
      { property: "og:title", content: "Home — SnapPots" },
      { property: "og:description", content: "Track your savings streak, pots and balance on SnapPots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { format } = useCurrency();
  const [topUp, setTopUp] = useState(false);

  const { data: profile } = useProfile(user.id);
  const { data: wallet } = useWallet(user.id);
  const { data: pots } = usePots(user.id);
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data ?? false,
  });

  const balance = Number(wallet?.balance ?? 0);
  const totalSaved = (pots ?? []).reduce((s, g) => s + Number(g.current_amount), 0);
  const totalInterest = (pots ?? []).reduce((s, g) => s + Number(g.interest_earned), 0);
  const verified = (profile?.kyc_level ?? 0) >= 1 && profile?.kyc_status === "approved";
  const streak = profile?.streak_count ?? 0;

  return (
    <AppShell userId={user.id}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <ClientOnly>
            <Antigravity count={200} color="#FFFC00" ringRadius={5} magnetRadius={5} waveAmplitude={0.8} particleSize={1.3} autoAnimate lerpSpeed={0.06} />
          </ClientOnly>
        </div>
        <div className="relative p-7">
          <h1 className="font-display text-3xl text-primary md:text-4xl">
            Hey {profile?.full_name?.split(" ")[0] ?? "saver"} 👋
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-flame" /> {streak}-day streak · save today to keep it alive
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setTopUp(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              <Zap className="h-4 w-4" /> Quick save
            </button>
            <Link to="/pots" search={{ new: true }} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-semibold">
              <Plus className="h-4 w-4" /> New pot
            </Link>
          </div>
        </div>
      </div>

      {!verified && (
        <Link to="/kyc" className="mt-5 flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Verify your BVN to unlock deposits</p>
              <p className="text-xs text-muted-foreground">Tier 1 · ₦200k daily / ₦2M monthly. Takes ~2 minutes.</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-primary">Start →</span>
        </Link>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Stat icon={Wallet} label="Wallet balance" value={format(balance)} />
        <Stat icon={Target} label="Across all pots" value={format(totalSaved)} />
        <Stat icon={TrendingUp} label="Interest earned" value={format(totalInterest)} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">Your pots</h2>
        <Link to="/pots" className="text-xs font-semibold text-primary">See all →</Link>
      </div>

      {pots && pots.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pots.slice(0, 4).map((g) => {
            const pct = potProgress(Number(g.current_amount), Number(g.target_amount));
            return (
              <Link key={g.id} to="/pots/$potId" params={{ potId: g.id }} className="rounded-3xl border border-border bg-card p-5 transition hover:border-primary/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{POT_META[(g.pot_type as PotType) ?? "solo"].label}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>{format(Number(g.current_amount))}</span>
                  <span>{format(Number(g.target_amount))}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-2xl text-primary">Start your first pot</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">Solo target, group Ajo with friends, or a flex pot you can dip into anytime.</p>
          <Link to="/pots" search={{ new: true }} className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Create a pot
          </Link>
        </div>
      )}

      {isAdmin && (
        <Link to="/admin/kyc" className="mt-8 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent">
          Admin · KYC queue
        </Link>
      )}

      <QuickSaveSheet
        open={topUp}
        onClose={() => setTopUp(false)}
        userId={user.id}
        pots={(pots ?? []).map((p) => ({ id: p.id, name: p.name, emoji: p.emoji }))}
      />
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4" /> {label}</div>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
