import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Copy, Link2, Loader2, Share2, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { QuickSaveSheet } from "@/components/quick-save-sheet";
import { useCurrency } from "@/lib/currency";
import { POT_META, isLocked, potProgress, type PotType } from "@/lib/pots";

export const Route = createFileRoute("/_authenticated/pots/$potId")({
  head: () => ({
    meta: [
      { title: "Pot details — SnapPots" },
      { name: "description", content: "Track your pot progress, top up, see the Ajo leaderboard and share your flex card." },
      { property: "og:title", content: "Pot details — SnapPots" },
      { property: "og:description", content: "Track pot progress, top up and share your savings flex card." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PotDetail,
});

function PotDetail() {
  const { user } = Route.useRouteContext();
  const { potId } = Route.useParams();
  const { format } = useCurrency();
  const qc = useQueryClient();
  const [topUp, setTopUp] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [cashOut, setCashOut] = useState(false);
  const [cashAmount, setCashAmount] = useState(1000);

  const { data: pot, isLoading } = useQuery({
    queryKey: ["pot", potId],
    queryFn: async () => (await supabase.from("savings_goals").select("*").eq("id", potId).maybeSingle()).data,
  });

  const { data: members } = useQuery({
    queryKey: ["pot-members", potId],
    queryFn: async () => {
      const rows = (await supabase.from("goal_members").select("*").eq("goal_id", potId)).data ?? [];
      if (rows.length === 0) return [];
      const ids = rows.map((r) => r.user_id);
      const profiles = (await supabase.from("profiles").select("id, full_name, username").in("id", ids)).data ?? [];
      return rows
        .map((r) => ({
          ...r,
          name: profiles.find((p) => p.id === r.user_id)?.full_name ?? profiles.find((p) => p.id === r.user_id)?.username ?? "Saver",
        }))
        .sort((a, b) => Number(b.contribution_total) - Number(a.contribution_total));
    },
  });

  const breakPot = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("break_pot", { _goal_id: potId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pot broken — funds returned to your wallet");
      void qc.invalidateQueries();
      setBreaking(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("pot_withdraw", { _goal_id: potId, _amount: cashAmount });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Moved to your wallet");
      void qc.invalidateQueries();
      setCashOut(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !pot) {
    return (
      <AppShell userId={user.id}>
        <p className="py-20 text-center text-sm text-muted-foreground">{isLoading ? "Loading pot…" : "Pot not found."}</p>
      </AppShell>
    );
  }

  const type = ((pot.pot_type as PotType) ?? "solo");
  const pct = potProgress(Number(pot.current_amount), Number(pot.target_amount));
  const locked = isLocked(pot.lock_until);
  const penalty = (Number(pot.current_amount) * Number(pot.penalty_rate)) / 100;

  async function share() {
    const text = `I'm ${Math.round(pct)}% of the way to ${pot!.name} ${pot!.emoji} on SnapPots 🔥`;
    try {
      if (navigator.share) await navigator.share({ title: "SnapPots", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Flex card text copied");
      }
    } catch {
      /* dismissed */
    }
  }

  async function shareInvite() {
    const url = `${window.location.origin}/join/${pot!.invite_code}`;
    const text = `Join my ${pot!.emoji} ${pot!.name} pot on SnapPots — we're saving together.`;
    try {
      if (navigator.share) await navigator.share({ title: "Join my SnapPots pot", text, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Invite link copied");
      }
    } catch {
      /* dismissed */
    }
  }

  return (
    <AppShell userId={user.id}>
      <Link to="/pots" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All pots
      </Link>

      {/* Flex card */}
      <div className="mt-4 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{pot.emoji}</span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl text-primary">{pot.name}</h1>
            <p className="text-xs text-muted-foreground">
              {POT_META[type].label}
              {locked ? ` · 🔒 locked until ${new Date(pot.lock_until!).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="font-display text-4xl">{format(Number(pot.current_amount))}</p>
          </div>
          <p className="text-sm text-muted-foreground">of {format(Number(pot.target_amount))}</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs font-semibold text-primary">{Math.round(pct)}% there · {pot.interest_rate}% p.a.</p>

        <div className="mt-5 flex gap-2">
          <button onClick={() => setTopUp(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            <Zap className="h-4 w-4" /> Top up
          </button>
          {type === "flex" && !locked && (
            <button onClick={() => setCashOut(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-accent">
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </button>
          )}
          <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-accent">
            <Share2 className="h-4 w-4" /> Flex
          </button>
        </div>
      </div>

      {type === "group" && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 font-display text-xl"><Users className="h-4 w-4" /> Leaderboard</h2>
            {pot.invite_code && (
              <div className="flex gap-2">
                <button
                  onClick={() => { void navigator.clipboard.writeText(pot.invite_code!); toast.success("Invite code copied"); }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  <Copy className="h-3 w-3" /> {pot.invite_code}
                </button>
                <button onClick={shareInvite} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  <Link2 className="h-3 w-3" /> Share link
                </button>
              </div>
            )}
          </div>
          <ol className="mt-4 space-y-2">
            {(members ?? []).map((m, i) => (
              <li key={m.id} className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 text-sm">
                <span className="flex items-center gap-3">
                  <span className="font-display text-lg text-primary">{i + 1}</span>
                  <span className={m.user_id === user.id ? "font-semibold text-primary" : ""}>{m.name}</span>
                </span>
                <span className="text-muted-foreground">{format(Number(m.contribution_total))}</span>
              </li>
            ))}
            {(members ?? []).length === 0 && <p className="text-sm text-muted-foreground">No members yet — share your invite code.</p>}
          </ol>
        </section>
      )}

      {pot.created_by === user.id && pot.status === "active" && (
        <button
          onClick={() => setBreaking(true)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive"
        >
          <AlertTriangle className="h-4 w-4" /> Break this pot
        </button>
      )}

      {breaking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setBreaking(false)}>
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 safe-bottom" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-destructive">Break pot early?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {locked
                ? `This pot is locked until ${new Date(pot.lock_until!).toLocaleDateString()}. Breaking now costs a ${pot.penalty_rate}% penalty — about ${format(penalty)}.`
                : "This pot isn't locked, so no penalty applies. Your balance returns to your wallet."}
            </p>
            <p className="mt-3 rounded-2xl border border-border bg-background p-4 text-sm">
              You'll receive roughly <span className="font-display text-xl text-primary">{format(Math.max(0, Number(pot.current_amount) - (locked ? penalty : 0)))}</span>
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setBreaking(false)} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold">Keep saving</button>
              <button
                disabled={breakPot.isPending}
                onClick={() => breakPot.mutate()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground disabled:opacity-60"
              >
                {breakPot.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Break pot
              </button>
            </div>
          </div>
        </div>
      )}

      {cashOut && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCashOut(false)}>
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 safe-bottom" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl">Move to wallet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Flex pots have no penalty. You have {format(Number(pot.current_amount))} in {pot.name}.
            </p>
            <label className="mt-4 block text-xs font-medium text-muted-foreground">Amount (₦)</label>
            <input
              type="number"
              min={100}
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 font-display text-2xl"
            />
            <div className="mt-5 flex gap-2">
              <button onClick={() => setCashOut(false)} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold">Cancel</button>
              <button
                disabled={withdraw.isPending || cashAmount <= 0 || cashAmount > Number(pot.current_amount)}
                onClick={() => withdraw.mutate()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {withdraw.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      <QuickSaveSheet
        open={topUp}
        onClose={() => setTopUp(false)}
        userId={user.id}
        pots={[{ id: pot.id, name: pot.name, emoji: pot.emoji }]}
        defaultPotId={pot.id}
      />
    </AppShell>
  );
}
