import { createFileRoute } from "@tanstack/react-router";
import { Lock, Landmark, ShieldCheck, KeyRound, FileCheck, AlertTriangle, Fingerprint, ServerCog } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Trust — SnapPots" },
      {
        name: "description",
        content:
          "How SnapPots protects your savings: AES-256 at rest, TLS 1.3 in transit, funds held with licensed Microfinance Bank partners, tiered BVN/NIN verification and NDPR-compliant data handling.",
      },
      { property: "og:title", content: "SnapPots Security" },
      { property: "og:description", content: "Bank-grade encryption, licensed partner banks, tiered identity checks, NDPR compliant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Security,
});

const items = [
  { icon: Lock, t: "Encrypted end to end", b: "TLS 1.3 on every connection, AES-256 for data at rest. Your BVN and NIN are stored tokenised, never in plain text." },
  { icon: Landmark, t: "Funds held in trust", b: "Customer balances sit in segregated accounts with CBN-licensed Microfinance Bank partners — never mixed with SnapPots operating money." },
  { icon: Fingerprint, t: "Sign-in you control", b: "Optional two-factor authentication, device sign-in alerts, and automatic session timeouts on idle devices." },
  { icon: FileCheck, t: "Tiered identity checks", b: "BVN for Tier 1, NIN plus a government ID and selfie for Tier 2, proof of address for Tier 3. Reviewed by a human before limits change." },
  { icon: AlertTriangle, t: "Velocity & anomaly watch", b: "Every withdrawal is checked against your daily and monthly caps, and unusual patterns are flagged before money moves." },
  { icon: ServerCog, t: "Full audit trail", b: "Every top-up, withdrawal, pot break and admin decision is written to an immutable ledger with a unique reference." },
  { icon: ShieldCheck, t: "NDPR compliant", b: "We follow the Nigeria Data Protection Regulation, report incidents within 72 hours and have an appointed Data Protection Officer." },
  { icon: KeyRound, t: "You can always leave", b: "Export your transaction history any time, close your account, and request deletion of your personal data." },
];

const badges = ["TLS 1.3", "AES-256", "NDPR", "PCI-DSS aligned partners", "NIBSS-connected payouts", "NDIC-covered partner bank"];

function Security() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <p className="text-sm text-muted-foreground">Security</p>
        <h1 className="mt-2 font-display text-5xl text-foreground md:text-6xl">Your money, protected.</h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          SnapPots is playful on the surface and boring underneath — exactly how money infrastructure should be.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {badges.map((b) => (
            <span key={b} className="rounded-full border border-border px-3 py-1">{b}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((i) => (
            <div key={i.t} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <i.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl text-foreground">{i.t}</h2>
              <p className="mt-2 text-muted-foreground">{i.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground">
          <h2 className="font-display text-3xl">Report a vulnerability</h2>
          <p className="mt-3 text-primary-foreground/70">
            Found a security issue? We take responsible disclosure seriously. Reach us at{" "}
            <strong className="text-primary-foreground">security@snappots.ng</strong>. Valid reports may be eligible for a bounty.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
