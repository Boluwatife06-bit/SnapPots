import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Target, Users, Zap } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How SnapPots works — Pots, streaks & payouts" },
      {
        name: "description",
        content:
          "Create a Solo, Group (Ajo) or Flex Pot, automate roundups, keep a daily streak and withdraw to your bank. See exactly how SnapPots saving works.",
      },
      { property: "og:title", content: "How SnapPots works" },
      { property: "og:description", content: "Pick a Pot, automate it, keep the streak, cash out to your bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { n: "01", t: "Sign up in under a minute", b: "Email or Google. No paperwork, no branch visit. You get a wallet the moment you land." },
  { n: "02", t: "Verify your identity", b: "BVN unlocks Tier 1 (₦200k daily). Add your NIN and ID for Tier 2 and higher limits." },
  { n: "03", t: "Create your Pot", b: "Solo target, Group Ajo or Flex. Name it, add an emoji, set an amount and a maturity date." },
  { n: "04", t: "Fund it and keep the streak", b: "Top up from your wallet any day. Every day you save adds a flame to your streak 🔥." },
  { n: "05", t: "Withdraw", b: "Flex Pots pay out instantly. Solo Pots pay out at maturity — break early and a small penalty applies." },
];

const potTypes = [
  { icon: Target, t: "Solo target Pot", b: "Locked until your date. Best for gadgets, rent, japa funds and anything you'd otherwise spend." },
  { icon: Users, t: "Group Pot (Ajo/Esusu)", b: "Share an invite code, save together, and watch the live leaderboard keep everybody honest." },
  { icon: Zap, t: "Flex Pot", b: "Instant access with no penalty. Your emergency stash that still earns." },
];

function HowItWorks() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(12);
  const rate = 0.15;
  const projected = Math.round(amount * rate * (months / 12));

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Flame className="h-3.5 w-3.5" /> Saving, but make it a game
        </span>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-6xl">How SnapPots works</h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Five steps from sign-up to payout. No branch, no forms, no shouting at a bank app.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <ol className="space-y-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-start gap-5">
                <span className="font-display text-4xl text-primary">{s.n}</span>
                <div>
                  <h2 className="font-display text-2xl text-foreground">{s.t}</h2>
                  <p className="mt-2 text-muted-foreground">{s.b}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-center font-display text-4xl text-foreground">Three kinds of Pot</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {potTypes.map((p) => (
            <div key={p.t} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-foreground">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10">
          <h2 className="font-display text-3xl text-foreground">Savings calculator</h2>
          <p className="mt-2 text-sm text-muted-foreground">Indicative yield at 15% p.a. Rates vary by Pot type and are not guaranteed.</p>

          <label className="mt-6 block text-sm text-muted-foreground" htmlFor="amount">
            Amount saved: <span className="font-semibold text-foreground">₦{amount.toLocaleString()}</span>
          </label>
          <input
            id="amount"
            type="range"
            min={10000}
            max={2000000}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />

          <label className="mt-6 block text-sm text-muted-foreground" htmlFor="months">
            Time: <span className="font-semibold text-foreground">{months} months</span>
          </label>
          <input
            id="months"
            type="range"
            min={1}
            max={36}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
          />

          <div className="mt-8 rounded-2xl bg-muted/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">Estimated earnings</p>
            <p className="mt-1 font-display text-4xl text-primary">₦{projected.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total at maturity ≈ ₦{(amount + projected).toLocaleString()}</p>
          </div>

          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground"
          >
            Create your first Pot
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
