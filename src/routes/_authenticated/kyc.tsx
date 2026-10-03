import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Shield, ShieldAlert, ShieldCheck, Upload } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { kycSchema, ID_TYPE_LABELS, type KycInput } from "@/lib/kyc-schema";

export const Route = createFileRoute("/_authenticated/kyc")({
  head: () => ({ meta: [
    { title: "Verify your identity — SnapPots" },
    { name: "description", content: "Submit your identity details for SnapPots verification and higher savings limits." },
    { property: "og:title", content: "Verify your identity — SnapPots" },
    { property: "og:description", content: "Verify your identity to unlock higher savings limits on SnapPots." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: KycPage,
});

const MAX_FILE_MB = 5;

function KycPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });

  const { data: submission, isLoading } = useQuery({
    queryKey: ["kyc", user.id],
    queryFn: async () =>
      (await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      ).data,
  });

  const [form, setForm] = useState<KycInput>({
    bvn: "",
    full_name: "",
    date_of_birth: "",
    id_type: "nin_slip",
  });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = kycSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      if (!idFile) throw new Error("Upload a photo of your ID document");
      if (!selfieFile) throw new Error("Upload a selfie holding your ID");
      for (const f of [idFile, selfieFile]) {
        if (f.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`Each file must be under ${MAX_FILE_MB}MB`);
        if (!f.type.startsWith("image/")) throw new Error("Only image files are allowed");
      }
      const stamp = Date.now();
      const idPath = `${user.id}/${stamp}-id-${idFile.name.replace(/[^\w.-]/g, "_")}`;
      const selfiePath = `${user.id}/${stamp}-selfie-${selfieFile.name.replace(/[^\w.-]/g, "_")}`;
      const up1 = await supabase.storage.from("kyc-documents").upload(idPath, idFile, { upsert: false });
      if (up1.error) throw up1.error;
      const up2 = await supabase.storage.from("kyc-documents").upload(selfiePath, selfieFile, { upsert: false });
      if (up2.error) throw up2.error;
      const { error } = await supabase.from("kyc_submissions").insert({
        user_id: user.id,
        tier: 1,
        bvn: parsed.data.bvn,
        full_name: parsed.data.full_name,
        date_of_birth: parsed.data.date_of_birth,
        id_type: parsed.data.id_type,
        id_document_path: idPath,
        selfie_path: selfiePath,
        status: "pending",
      });
      if (error) throw error;
      await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", user.id);
    },
    onSuccess: () => {
      toast.success("Submitted! We'll review within 24 hours.");
      qc.invalidateQueries({ queryKey: ["kyc", user.id] });
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const level = profile?.kyc_level ?? 0;
  const status = submission?.status ?? profile?.kyc_status ?? "unverified";
  const isVerified = level >= 1 && status === "approved";
  const isPending = status === "pending" && !isVerified;
  const isRejected = status === "rejected";

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button onClick={() => navigate({ to: "/dashboard" })} className="mb-6 text-sm text-muted-foreground hover:text-foreground">← Back to dashboard</button>

        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl ${isVerified ? "bg-success/15 text-success" : isRejected ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"}`}>
            {isVerified ? <ShieldCheck className="h-5 w-5" /> : isRejected ? <ShieldAlert className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="font-display text-3xl text-primary">Verify your identity</h1>
            <p className="text-sm text-muted-foreground">Tier 1 · Unlock ₦200,000 daily / ₦2,000,000 monthly limits</p>
          </div>
        </div>

        {isVerified && (
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-5 text-success">
            <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5" /> You're verified at Tier 1</div>
            <p className="mt-1 text-sm text-success/80">Deposits and withdrawals up to ₦200k/day are enabled. Higher limits require Tier 2.</p>
            <Link to="/wallet" className="mt-4 inline-block rounded-full bg-success px-4 py-2 text-sm font-medium text-success-foreground">Go to wallet</Link>
          </div>
        )}

        {isPending && (
          <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-5">
            <p className="font-medium text-foreground">Review in progress</p>
            <p className="mt-1 text-sm text-muted-foreground">We received your submission on {submission ? new Date(submission.created_at).toLocaleString() : ""}. Reviews typically complete within 24 hours.</p>
          </div>
        )}

        {isRejected && submission && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
            <p className="font-medium text-destructive">Verification not approved</p>
            {submission.review_notes && <p className="mt-1 text-sm text-foreground/80">Reviewer note: {submission.review_notes}</p>}
            <p className="mt-2 text-sm text-muted-foreground">Please review the details below and re-submit.</p>
          </div>
        )}

        {!isVerified && !isPending && (
          <form
            className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft"
            onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
          >
            <Field label="Full legal name (as on your ID)">
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Amaka Chinwe Okoye" className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="BVN (11 digits)">
                <input required inputMode="numeric" maxLength={11} value={form.bvn} onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })} placeholder="12345678901" className={inputCls} />
              </Field>
              <Field label="Date of birth">
                <input required type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="ID document type">
              <select value={form.id_type} onChange={(e) => setForm({ ...form, id_type: e.target.value as KycInput["id_type"] })} className={inputCls}>
                {Object.entries(ID_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <FileField label="Photo of your ID" file={idFile} onChange={setIdFile} />
            <FileField label="Selfie holding your ID" file={selfieFile} onChange={setSelfieFile} />

            <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              Your BVN is used only to verify your identity with your bank of record. We never share it. Files are encrypted at rest and only visible to our review team.
            </p>

            <button
              disabled={submit.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Submit for review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-accent/40">
        <span className="truncate">{file ? file.name : "PNG or JPG · up to 5MB"}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Upload className="h-3 w-3" /> Choose
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
