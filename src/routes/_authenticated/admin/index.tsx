import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — SnapPots" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminHome,
});

type Tab = "users" | "pots" | "transactions" | "alerts";
const ngn = (n: number) => "₦" + Number(n ?? 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });
const when = (s: string) => new Date(s).toLocaleString();

function AdminHome() {
  const [tab, setTab] = useState<Tab>("users");

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const c = (t: "profiles" | "savings_goals" | "transactions" | "kyc_submissions") =>
        supabase.from(t).select("id", { count: "exact", head: true });
      const [u, p, t, k, w] = await Promise.all([
        c("profiles"), c("savings_goals"), c("transactions"),
        supabase.from("kyc_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("wallets").select("balance"),
      ]);
      return {
        users: u.count ?? 0, pots: p.count ?? 0, txns: t.count ?? 0, pendingKyc: k.count ?? 0,
        held: (w.data ?? []).reduce((s, r) => s + Number(r.balance), 0),
      };
    },
  });

  const rows = useQuery({
    queryKey: ["admin-rows", tab],
    queryFn: async () => {
      if (tab === "users") return (await supabase.from("profiles").select("id,full_name,username,phone_number,kyc_level,kyc_status,streak_count,created_at").order("created_at", { ascending: false }).limit(200)).data ?? [];
      if (tab === "pots") return (await supabase.from("savings_goals").select("id,emoji,name,pot_type,status,current_amount,target_amount,due_date,created_at").order("created_at", { ascending: false }).limit(200)).data ?? [];
      if (tab === "transactions") return (await supabase.from("transactions").select("id,type,status,amount,fee_amount,reference,description,created_at").order("created_at", { ascending: false }).limit(200)).data ?? [];
      return (await supabase.from("notifications").select("id,type,title,body,is_read,created_at").order("created_at", { ascending: false }).limit(200)).data ?? [];
    },
  });

  const s = stats.data;
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
        <h1 className="mt-2 font-display text-4xl text-primary">Admin overview</h1>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[["Users", s?.users], ["Pots", s?.pots], ["Transactions", s?.txns], ["Wallet funds", s ? ngn(s.held) : undefined]].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="mt-1 text-2xl font-bold">{v ?? "—"}</p>
            </div>
          ))}
          <Link to="/admin/kyc" className="rounded-2xl border border-primary/40 bg-primary/10 p-4 hover:bg-primary/20">
            <p className="text-xs text-muted-foreground">Pending verifications</p>
            <p className="mt-1 text-2xl font-bold text-primary">{s?.pendingKyc ?? "—"} →</p>
          </Link>
        </div>

        <div className="mt-8 inline-flex flex-wrap rounded-full border border-border bg-card p-1">
          {(["users", "pots", "transactions", "alerts"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          {rows.isLoading ? (
            <div className="grid place-items-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (rows.data ?? []).length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {(rows.data as any[]).map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    {tab === "users" && <>
                      <td className="p-3 font-medium">{r.full_name ?? r.username ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{r.phone_number ?? "—"}</td>
                      <td className="p-3">Tier {r.kyc_level} · {r.kyc_status}</td>
                      <td className="p-3">🔥 {r.streak_count}</td>
                      <td className="p-3 text-xs text-muted-foreground">{when(r.created_at)}</td>
                    </>}
                    {tab === "pots" && <>
                      <td className="p-3 font-medium">{r.emoji} {r.name}</td>
                      <td className="p-3 capitalize">{r.pot_type}</td>
                      <td className="p-3 capitalize">{r.status}</td>
                      <td className="p-3">{ngn(r.current_amount)} / {ngn(r.target_amount)}</td>
                      <td className="p-3 text-xs text-muted-foreground">Due {r.due_date}</td>
                    </>}
                    {tab === "transactions" && <>
                      <td className="p-3 font-medium capitalize">{r.type.replace("_", " ")}</td>
                      <td className="p-3 capitalize">{r.status}</td>
                      <td className="p-3">{ngn(r.amount)}{Number(r.fee_amount) > 0 && <span className="text-xs text-muted-foreground"> (fee {ngn(r.fee_amount)})</span>}</td>
                      <td className="p-3 font-mono text-xs">{r.reference}</td>
                      <td className="p-3 text-xs text-muted-foreground">{when(r.created_at)}</td>
                    </>}
                    {tab === "alerts" && <>
                      <td className="p-3 font-medium">{r.title}</td>
                      <td className="p-3 text-muted-foreground">{r.body}</td>
                      <td className="p-3 text-xs">{r.type}</td>
                      <td className="p-3 text-xs">{r.is_read ? "Read" : "Unread"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{when(r.created_at)}</td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
