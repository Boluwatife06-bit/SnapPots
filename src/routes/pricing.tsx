import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SnapPots" },
      {
        name: "description",
        content:
          "SnapPots is free to save with. Go Premium at ₦4,500/month for streak freezes, custom themes, deeper analytics and priority payouts.",
      },
      { property: "og:title", content: "SnapPots Pricing" },
      { property: "og:description", content: "Free forever to save. Premium ₦4,500/mo for streak freezes and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    tag: "Get started",
    features: [
      "Unlimited Solo, Group and Flex Pots",
      "Daily savings streak & flex cards",
      "Indicative yield up to 15% p.a.",
      "Wallet to bank withdrawals",
      "PDF receipts on every transaction",
      "In-app alerts",
    ],
    cta: "Create free account",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₦4,500",
    period: "per month",
    tag: "Best for serious savers",
    features: [
      "Everything in Free, plus:",
      "Streak freezes — one bad day won't reset you",
      "Custom Pot themes & animated flex cards",
      "Deeper savings analytics",
      "Priority withdrawals",
      "Priority support",
    ],
    cta: "Start free — upgrade later",
    highlight: true,
  },
];

function Pricing() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <p className="text-sm text-muted-foreground">Pricing</p>
        <h1 className="mt-2 font-display text-5xl text-foreground md:text-6xl">Free to save. Premium to flex.</h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          No fee to open a Pot, no fee to fund it. You only pay a small charge when money leaves for your bank.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl border p-8 shadow-soft ${
                t.highlight ? "border-primary bg-card ring-1 ring-primary/40" : "border-border bg-card"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.tag}</p>
              <h2 className="mt-3 font-display text-3xl text-foreground">{t.name}</h2>
              <p className="mt-3">
                <span className="font-display text-4xl text-primary">{t.price}</span>{" "}
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ${
                  t.highlight ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-2xl text-foreground">Transaction charges</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Withdrawal to bank: 0.5% of the amount, minimum ₦25, capped at ₦500.</li>
            <li>Breaking a locked Solo Pot before maturity: 5% of your contribution.</li>
            <li>Everything else — funding, Pot creation, Flex withdrawals, receipts — is free.</li>
          </ul>
          <Link to="/interest-rates" className="mt-6 inline-flex rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent">
            See rates and fees
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
