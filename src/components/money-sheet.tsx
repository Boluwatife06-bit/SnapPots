import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";

const PRESETS = [1000, 5000, 10000, 25000];

export type BankOption = { id: string; bank_name: string; account_number: string };

export function MoneySheet({
  mode,
  open,
  onClose,
  balance,
  banks,
}: {
  mode: "deposit" | "withdraw";
  open: boolean;
  onClose: () => void;
  balance: number;
  banks: BankOption[];
}) {
  const qc = useQueryClient();
  const { format } = useCurrency();
  const [amount, setAmount] = useState(5000);
  const [bankId, setBankId] = useState(banks[0]?.id ?? "");

  const fee = mode === "withdraw" ? Math.min(Math.max(amount * 0.005, 25), 500) : 0;

  const run = useMutation({
    mutationFn: async () => {
      if (mode === "deposit") {
        const { error } = await supabase.rpc("wallet_deposit", { _amount: amount });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("wallet_withdraw", { _amount: amount, _bank_account_id: bankId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(mode === "deposit" ? `Wallet funded with ${format(amount)}` : `${format(amount - fee)} sent to your bank`);
      void qc.invalidateQueries();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;
  const disabled = run.isPending || amount < 100 || (mode === "withdraw" && (!bankId || amount > balance));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-elevated safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{mode === "deposit" ? "Fund wallet" : "Withdraw to bank"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block text-xs font-medium text-muted-foreground">Amount (₦)</label>
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

        {mode === "withdraw" && (
          <>
            <label className="mt-4 block text-xs font-medium text-muted-foreground">Send to</label>
            {banks.length === 0 ? (
              <p className="mt-1.5 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Add a bank account first.
              </p>
            ) : (
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name} ••••{b.account_number.slice(-4)}
                  </option>
                ))}
              </select>
            )}
            <div className="mt-4 space-y-1 rounded-2xl border border-border bg-background p-4 text-sm">
              <Row label="Amount" value={format(amount)} />
              <Row label="Fee (0.5%, min ₦25, max ₦500)" value={format(fee)} />
              <Row label="You receive" value={format(Math.max(0, amount - fee))} strong />
            </div>
            {amount > balance && <p className="mt-2 text-xs text-destructive">That's more than your wallet balance.</p>}
          </>
        )}

        <button
          disabled={disabled}
          onClick={() => run.mutate()}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {run.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "deposit" ? (
            <ArrowDownLeft className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          {mode === "deposit" ? "Fund wallet" : "Withdraw"}
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {mode === "deposit"
            ? "Your balance updates instantly and a receipt is saved to your activity."
            : "Payouts land in your bank account and a receipt is saved to your activity."}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-lg text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}

export function AddBankSheet({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const qc = useQueryClient();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bank_accounts").insert({
        user_id: userId,
        bank_name: bankName.trim(),
        bank_code: "000",
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        is_default: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bank account added");
      void qc.invalidateQueries({ queryKey: ["banks", userId] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;
  const valid = bankName.trim().length > 1 && /^\d{10}$/.test(accountNumber.trim()) && accountName.trim().length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 safe-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Add bank account</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <Field label="Bank name" value={bankName} onChange={setBankName} placeholder="GTBank" />
        <Field label="Account number" value={accountNumber} onChange={setAccountNumber} placeholder="0123456789" inputMode="numeric" />
        <Field label="Account name" value={accountName} onChange={setAccountName} placeholder="Ada Obi" />
        <button
          disabled={!valid || save.isPending}
          onClick={() => save.mutate()}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save account
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <>
      <label className="mt-4 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
      />
    </>
  );
}
