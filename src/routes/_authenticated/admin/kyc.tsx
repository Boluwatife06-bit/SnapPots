import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ID_TYPE_LABELS } from "@/lib/kyc-schema";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  head: () => ({ meta: [{ title: "KYC review — Admin" }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminKyc,
});

function AdminKyc() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-kyc", tab],
    queryFn: async () => (await supabase.from("kyc_submissions").select("*").eq("status", tab).order("created_at", { ascending: false })).data ?? [],
  });

  const review = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: "approved" | "rejected"; notes?: string }) => {
      const { error } = await supabase.rpc("review_kyc", { _submission_id: id, _approve: status === "approved", _notes: notes ?? undefined });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
        <h1 className="mt-2 font-display text-4xl text-primary">KYC review queue</h1>

        <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : rows && rows.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {rows.map((r) => <ReviewRow key={r.id} row={r} onDecide={(status, notes) => review.mutate({ id: r.id, status, notes })} />)}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">No {tab} submissions.</p>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ row, onDecide }: { row: any; onDecide: (status: "approved" | "rejected", notes?: string) => void }) {
  const [notes, setNotes] = useState("");
  const [urls, setUrls] = useState<{ id?: string; selfie?: string }>({});

  async function loadUrls() {
    const [a, b] = await Promise.all([
      supabase.storage.from("kyc-documents").createSignedUrl(row.id_document_path, 300),
      supabase.storage.from("kyc-documents").createSignedUrl(row.selfie_path, 300),
    ]);
    setUrls({ id: a.data?.signedUrl, selfie: b.data?.signedUrl });
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl text-primary">{row.full_name}</p>
          <p className="text-sm text-muted-foreground">
            BVN: <span className="font-mono">{row.bvn}</span> · DOB: {row.date_of_birth} · {ID_TYPE_LABELS[row.id_type as keyof typeof ID_TYPE_LABELS] ?? row.id_type}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(row.created_at).toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{row.status}</span>
      </div>

      {urls.id || urls.selfie ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {urls.id && <a href={urls.id} target="_blank" rel="noreferrer"><img src={urls.id} alt="ID" className="h-48 w-full rounded-xl border border-border object-cover" /></a>}
          {urls.selfie && <a href={urls.selfie} target="_blank" rel="noreferrer"><img src={urls.selfie} alt="Selfie" className="h-48 w-full rounded-xl border border-border object-cover" /></a>}
        </div>
      ) : (
        <button onClick={loadUrls} className="mt-4 rounded-full border border-border px-4 py-1.5 text-xs hover:bg-accent">Load documents</button>
      )}

      {row.status === "pending" && (
        <div className="mt-4 space-y-3">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reviewer note (required on reject)" className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm" rows={2} />
          <div className="flex gap-2">
            <button onClick={() => onDecide("approved")} className="rounded-full bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:opacity-90">Approve · unlock Tier 1</button>
            <button onClick={() => onDecide("rejected", notes || "Documents unclear.")} className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">Reject</button>
          </div>
        </div>
      )}
      {row.review_notes && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Note: {row.review_notes}</p>}
    </li>
  );
}
