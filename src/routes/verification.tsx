import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, IdCard, Home, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Identity Verification (KYC) — SnapPots" },
      {
        name: "description",
        content:
          "How SnapPots identity verification works: BVN for Tier 1, NIN plus ID and selfie for Tier 2, proof of address for Tier 3 — and the limits each tier unlocks.",
      },
      { property: "og:title", content: "SnapPots Identity Verification" },
      { property: "og:description", content: "BVN, NIN and address checks — and the saving limits each unlocks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Verification,
});

const tiers = [
  {
    icon: BadgeCheck,
    name: "Tier 1 — BVN",
    need: "Your BVN, full legal name and date of birth.",
    limits: "₦200,000 a day · ₦2,000,000 a month",
    time: "Usually reviewed within a few hours",
  },
  {
    icon: IdCard,
    name: "Tier 2 — NIN + ID",
    need: "Your NIN, a government ID (NIN slip, voter's card, driver's licence or passport) and a selfie.",
    limits: "₦1,000,000 a day · ₦10,000,000 a month",
    time: "Usually reviewed within one business day",
  },
  {
    icon: Home,
    name: "Tier 3 — Proof of address",
    need: "A recent utility bill or bank statement showing your address.",
    limits: "No preset cap — reviewed case by case",
    time: "Up to two business days",
  },
];

function Verification() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Required before money moves
        </span>
        <h1 className="mt-6 font-display text-5xl text-foreground md:text-6xl">Verify once. Save without limits.</h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Nigerian regulation requires us to confirm who you are before you can fund a wallet or withdraw. It takes about two
          minutes, and every tier you clear raises your limits.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-5">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-foreground">{t.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{t.need}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.time}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-4 py-2 text-xs font-semibold text-foreground">{t.limits}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-xl text-foreground">What we do with your data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your BVN and NIN are stored tokenised and used only to confirm your identity. Documents sit in encrypted storage that
              only a reviewer can open, with every access logged.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-xl text-foreground">If something's rejected</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You'll get an alert explaining exactly what to fix — usually a blurry photo or a name that doesn't match your BVN — and
              you can resubmit straight away.
            </p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">
            Get verified
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
