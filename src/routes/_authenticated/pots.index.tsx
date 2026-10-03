import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { QuickSaveSheet } from "@/components/quick-save-sheet";
import { useCurrency } from "@/lib/currency";
import { POT_META, isLocked, potProgress, usePots, type PotType } from "@/lib/pots";

export const Route = createFileRoute("/_authenticated/pots/")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } =>
    s.new === true || s.new === "true" ? { new: true } : {},
  head: () => ({
    meta: [
      { title: "Your Pots — SnapPots" },
      { name: "description", content: "Create solo, group (Ajo) and flex savings pots, top them up and keep your streak alive." },
      { property: "og:title", content: "Your Pots — SnapPots" },
      { property: "og:description", content: "Solo, group Ajo and flex savings pots in one gamified wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PotsPage,
});

function PotsPage() {
  const { user } = Route.useRouteContext();
  const search = Route.useSearch();
  const { format } = useCurrency();
  const { data: pots } = usePots(user.id);
  const [creating, setCreating] = useState(!!search.new);
  const [joining, setJoining] = useState(false);
  const [topUp, setTopUp] = useState(false);

  return (
    <AppShell userId={user.id}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Your pots</h1>
        <div className="flex gap-2">
          <button onClick={() => setJoining(true)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
            <Users className="mr-1 inline h-3.5 w-3.5" /> Join
          </button>
          <button onClick={() => setCreating(true)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            <Plus className="mr-1 inline h-3.5 w-3.5" /> New pot
          </button>
        </div>
      </div>

      {pots && pots.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pots.map((p) => {
            const pct = potProgress(Number(p.current_amount), Number(p.target_amount));
            return (
              <Link
                key={p.id}
                to="/pots/$potId"
                params={{ potId: p.id }}
                className="rounded-3xl border border-border bg-card p-5 transition hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {POT_META[(p.pot_type as PotType) ?? "solo"].label}
                      {isLocked(p.lock_until) ? " · 🔒 locked" : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>{format(Number(p.current_amount))}</span>
                  <span>{format(Number(p.target_amount))}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-2xl text-primary">No pots yet</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Start a solo target, an Ajo group with friends, or a flex pot you can dip into anytime.
          </p>
          <button onClick={() => setCreating(true)} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Create your first pot
          </button>
        </div>
      )}

      {pots && pots.length > 0 && (
        <button
          onClick={() => setTopUp(true)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary"
        >
          <Zap className="h-4 w-4" /> Quick top-up
        </button>
      )}

      <QuickSaveSheet
        open={topUp}
        onClose={() => setTopUp(false)}
        userId={user.id}
        pots={(pots ?? []).map((p) => ({ id: p.id, name: p.name, emoji: p.emoji }))}
      />
      {creating && <CreatePotSheet onClose={() => setCreating(false)} />}
      {joining && <JoinPotSheet onClose={() => setJoining(false)} />}
    </AppShell>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 safe-bottom" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CreatePotSheet({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState(50000);
  const [due, setDue] = useState(() => new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10));
  const [type, setType] = useState<PotType>("solo");

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("create_pot", {
        _name: name,
        _emoji: emoji,
        _target: target,
        _due: due,
        _pot_type: type,
        _lock_until: type === "solo" ? due : undefined,
        _visibility: type === "group" ? "public" : "private",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pot created 🎉");
      void qc.invalidateQueries();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet title="New pot" onClose={onClose}>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(Object.keys(POT_META) as PotType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setEmoji(POT_META[t].emoji); }}
            className={`rounded-2xl border p-3 text-left text-xs ${type === t ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <div className="text-xl">{POT_META[t].emoji}</div>
            <div className="mt-1 font-semibold">{POT_META[t].label}</div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{POT_META[type].blurb}</p>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pot name" className="mt-4 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <input type="number" value={target} min={1000} onChange={(e) => setTarget(Number(e.target.value))} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
      </div>
      <button
        disabled={create.isPending || name.trim().length < 2}
        onClick={() => create.mutate()}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create pot
      </button>
    </Sheet>
  );
}

function JoinPotSheet({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const join = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("join_pot", { _invite_code: code.trim().toUpperCase() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You joined the pot 👯");
      void qc.invalidateQueries();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet title="Join a group pot" onClose={onClose}>
      <p className="mt-2 text-sm text-muted-foreground">Paste the invite code your friend shared.</p>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="INVITE CODE" className="mt-4 w-full rounded-xl border border-input bg-background px-3 py-3 text-center font-display text-xl tracking-widest" />
      <button
        disabled={join.isPending || code.trim().length < 4}
        onClick={() => join.mutate()}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {join.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Join pot
      </button>
    </Sheet>
  );
}
