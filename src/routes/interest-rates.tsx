import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/interest-rates")({
  head: () => ({
    meta: [
      { title: "Interest Rates — SnapPots" },
      {
        name: "description",
        content:
          "Indicative yields on SnapPots: up to 15% p.a. on locked Solo Pots, 10% on Group Ajo Pots and 8% on Flex Pots. Daily accrual, transparent fees, no hidden charges.",
      },
      { property: "og:title", content: "SnapPots Interest Rates" },
      { property: "og:description", content: "Up to 15% p.a. indicative on locked Pots. Daily accrual, weekly credit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rates,
});

const tiers = [
  { pot: "Solo target Pot (locked)", rate: "15.0% p.a.", note: "Highest yield — funds locked until your maturity date." },
  { pot: "Group Pot / Ajo", rate: "10.0% p.a.", note: "Shared target, contributions tracked per member." },
  { pot: "Flex Pot", rate: "8.0% p.a.", note: "Withdraw any time, no penalty, slightly lower yield." },
];

const fees = [
  ["Creating a Pot", "Free"],
  ["Funding your wallet", "Free"],
  ["Wallet to bank withdrawal", "0.5%, minimum ₦25, capped at ₦500"],
  ["Breaking a locked Pot early", "5% of your contribution"],
  ["Flex Pot withdrawal", "Free"],
];

function Rates() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <p className="text-sm text-muted-foreground">Interest rates</p>
        <h1 className="mt-2 font-display text-5xl text-foreground md:text-6xl">Earn while you save.</h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Yield accrues daily on your Pot balance and is credited weekly. The tighter the lock, the higher the rate.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          {tiers.map((t) => (
            <div key={t.pot} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-6 last:border-0">
              <div>
                <p className="font-display text-xl text-foreground">{t.pot}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
              </div>
              <span className="font-display text-3xl text-primary">{t.rate}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="font-display text-3xl text-foreground">Fees, in full</h2>
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          {fees.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 text-sm last:border-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-xl text-foreground">How it's calculated</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Daily accrual = (Pot balance × rate) ÷ 365. Accruals are credited into the same Pot every Monday at 00:00 WAT.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-xl text-foreground">Taxes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A 10% withholding tax on interest is deducted and remitted to the Federal Inland Revenue Service per Nigerian tax law.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Yields are indicative, not guaranteed, and may change with partner bank and money-market conditions.
        </p>
        <div className="mt-8 text-center">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">
            Start earning
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
