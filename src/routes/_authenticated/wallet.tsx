import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { AddBankSheet, MoneySheet } from "@/components/money-sheet";
import { useCurrency } from "@/lib/currency";
import { useProfile, useWallet } from "@/lib/pots";
import { downloadReceipt } from "@/lib/receipt";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — SnapPots" },
      { name: "description", content: "Your SnapPots wallet: balance, limits, linked banks and recent savings activity." },
      { property: "og:title", content: "Wallet — SnapPots" },
      { property: "og:description", content: "Check your balance, limits and savings activity on SnapPots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user } = Route.useRouteContext();
  const { format } = useCurrency();
  const [sheet, setSheet] = useState<"deposit" | "withdraw" | null>(null);
  const [addBank, setAddBank] = useState(false);

  const { data: profile } = useProfile(user.id);
  const { data: wallet } = useWallet(user.id);
  const { data: txns } = useQuery({
    queryKey: ["txns", user.id],
    queryFn: async () =>
      (await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)).data ?? [],
  });
  const { data: banks } = useQuery({
    queryKey: ["banks", user.id],
    queryFn: async () => (await supabase.from("bank_accounts").select("*").eq("user_id", user.id)).data ?? [],
  });

  const level = profile?.kyc_level ?? 0;
  const verified = level >= 1 && profile?.kyc_status === "approved";
  const balance = Number(wallet?.balance ?? 0);
  const daily = Number(wallet?.daily_limit ?? 0);
  const monthly = Number(wallet?.monthly_limit ?? 0);

  return (
    <AppShell userId={user.id}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Wallet</h1>
        {verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> Tier {level}
          </span>
        ) : (
          <Link to="/kyc" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
            <ShieldAlert className="h-3.5 w-3.5" /> Verify
          </Link>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-transparent p-7">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><WalletIcon className="h-4 w-4" /> Available balance</div>
        <p className="mt-2 font-display text-5xl">{format(balance)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={!verified}
            onClick={() => setSheet("deposit")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <ArrowDownLeft className="h-4 w-4" /> Deposit
          </button>
          <button
            disabled={!verified}
            onClick={() => setSheet("withdraw")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <ArrowUpRight className="h-4 w-4" /> Withdraw
          </button>
        </div>
        {!verified && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Deposits & withdrawals unlock after identity verification.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily limit</p>
          <p className="mt-1 font-display text-2xl text-primary">{format(daily)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly limit</p>
          <p className="mt-1 font-display text-2xl text-primary">{format(monthly)}</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-primary">Bank accounts</h2>
          <button
            disabled={!verified}
            onClick={() => setAddBank(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        {banks && banks.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {banks.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
                <div>
                  <p className="font-medium">{b.bank_name}</p>
                  <p className="text-sm text-muted-foreground">•••• {b.account_number.slice(-4)} · {b.account_name}</p>
                </div>
                {b.is_default && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {verified ? "No bank accounts yet. Add one to withdraw." : "Verify your identity first, then link a bank account."}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-primary">Recent activity</h2>
        {txns && txns.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium capitalize">{t.type.replace(/_/g, " ")}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()} · {t.status} · {t.reference}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className={`font-medium ${["deposit", "interest", "refund"].includes(t.type) ? "text-success" : "text-foreground"}`}>
                    {format(Number(t.amount))}
                  </p>
                  <button
                    onClick={() => downloadReceipt(t, profile?.full_name)}
                    aria-label={`Download receipt ${t.reference}`}
                    title="Download receipt"
                    className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
        )}
      </section>

      <MoneySheet
        mode={sheet ?? "deposit"}
        open={sheet !== null}
        onClose={() => setSheet(null)}
        balance={balance}
        banks={banks ?? []}
      />
      <AddBankSheet open={addBank} onClose={() => setAddBank(false)} userId={user.id} />
    </AppShell>
  );
}
