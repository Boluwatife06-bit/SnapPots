import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";

const PRESETS = [500, 1000, 2000, 5000];

export function QuickSaveSheet({
  open,
  onClose,
  userId,
  pots,
  defaultPotId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  pots: { id: string; name: string; emoji: string }[];
  defaultPotId?: string;
}) {
  const qc = useQueryClient();
  const { format } = useCurrency();
  const [amount, setAmount] = useState(1000);
  const [potId, setPotId] = useState(defaultPotId ?? pots[0]?.id ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("quick_save", { _goal_id: potId, _amount: amount });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Saved ${format(amount)} 🔥`);
      void qc.invalidateQueries();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-elevated safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Quick top-up</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {pots.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Create a pot first, then top it up from your wallet.</p>
        ) : (
          <>
            <label className="mt-5 block text-xs font-medium text-muted-foreground">Pot</label>
            <select
              value={potId}
              onChange={(e) => setPotId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
            >
              {pots.map((p) => (
                <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
              ))}
            </select>

            <label className="mt-4 block text-xs font-medium text-muted-foreground">Amount (₦)</label>
            <input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 font-display text-2xl"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    amount === p ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              disabled={save.isPending || !potId}
              onClick={() => save.mutate()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Save from wallet
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Money moves from your SnapPots wallet. Saving today keeps your streak alive.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
