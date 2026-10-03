import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Users, TrendingUp, ShieldCheck, Lock, Landmark, Star, Smartphone, Zap, Target } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnapPots — Save in Pots. Keep your streak. 🔥" },
      { name: "description", content: "The gamified micro-savings PWA for Nigerians 18-28. Solo, Group & Flex Pots, daily streaks, roundups and up to 15% p.a. indicative yield." },
      { property: "og:title", content: "SnapPots — Save in Pots. Keep your streak." },
      { property: "og:description", content: "Gamified micro-savings for young Nigerians. Install as a PWA, save daily, flex your wins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.05_100)_0%,transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Flame className="h-3.5 w-3.5" /> Install SnapPots — no app store needed
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
              Save it. Snap it.<br />
              <em className="text-primary not-italic">Flex the streak.</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Drop money into <strong className="text-foreground">Pots</strong>, build a daily savings streak 🔥, and earn up to <strong className="text-foreground">15% p.a.</strong>* on locked pots. Solo, with your squad, or Ajo-style.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth" search={{ mode: "signup" }} className="rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-elevated transition hover:opacity-90">
                Create your first Pot
              </Link>
              <Link to="/how-it-works" className="rounded-full border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground transition hover:bg-accent">
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Bank-grade encryption</span>
              <span className="inline-flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" /> Backed by licensed Microfinance Banks</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> BVN/NIN verified, NDPR compliant</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto mt-14 max-w-3xl">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solo Target Pot</p>
                  <p className="font-display text-3xl text-foreground">🎧 New AirPods</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-flame/10 px-3 py-1 text-xs font-semibold text-flame">
                  <Flame className="h-3.5 w-3.5" /> 21-day streak
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-end justify-between text-sm">
                  <span className="text-muted-foreground">₦84,000 of ₦120,000</span>
                  <span className="font-semibold text-primary">70%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-flame" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Save streak", value: "21 days" },
                  { label: "Roundups saved", value: "₦6,200" },
                  { label: "Est. yield", value: "+₦1,260" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 -top-4 hidden rotate-6 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft md:block">
              🔥 New personal best!
            </div>
          </div>
        </div>
      </section>

      {/* Pot types */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">Pot types</p>
          <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">A Pot for every kind of saver</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Solo Target Pots", body: "Lock funds toward a goal with a maturity date. Break early and a small penalty applies — discipline, gamified." },
            { icon: Users, title: "Group Pots / Digital Ajo", body: "Save with your squad or run a classic Ajo/Esusu circle. Invite codes, shared targets and a live leaderboard." },
            { icon: Zap, title: "Flex Pots", body: "Instant access, high indicative yield. Perfect for your emergency stash or short-term goals." },
          ].map((v) => (
            <div key={v.title} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Automated rules */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <h3 className="font-display text-2xl text-foreground">Save-As-You-Spend Roundups</h3>
            <p className="mt-3 text-muted-foreground">Every card transaction rounds up to the nearest ₦100 — the spare change slides straight into your Pot without you thinking about it.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <h3 className="font-display text-2xl text-foreground">Income Slicers</h3>
            <p className="mt-3 text-muted-foreground">Set a percentage of every inbound deposit — salary, hustle money, transfers — to auto-slice into your Pots the moment it lands.</p>
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm text-primary-foreground/60">How it works</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Three steps to your first flex</h2>
              <p className="mt-4 max-w-md text-primary-foreground/70">From gadgets to rent, Detty December to a group Ajo — pick a Pot, automate it, and watch the streak grow.</p>
              <Link to="/how-it-works" className="mt-6 inline-block rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground">Learn more</Link>
            </div>
            <ol className="space-y-4">
              {[
                ["01","Create a Pot","Pick Solo, Group or Flex. Name it, set a target, pick an emoji."],
                ["02","Automate it","Turn on roundups or an Income Slicer so it saves itself."],
                ["03","Keep the streak","Save daily, climb the leaderboard, and share your milestone cards."],
              ].map(([n,t,b]) => (
                <li key={n} className="flex gap-5 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5">
                  <span className="font-display text-3xl text-background">{n}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="mt-1 text-sm text-primary-foreground/70">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Social proof / flex cards */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-display text-4xl text-foreground md:text-5xl">Flexed by savers across Nigeria</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { q: "My 60-day streak flex card got more comments than my birthday post 😂. This app made saving fun.", n: "Amaka O.", r: "Lagos" },
            { q: "Ran our owambe Ajo through SnapPots' Group Pots — leaderboard kept everybody honest.", n: "Tobi M.", r: "Abuja" },
            { q: "Roundups quietly saved me ₦18k in a month without me feeling it at all.", n: "Chidera E.", r: "Enugu" },
          ].map((t) => (
            <figure key={t.n} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex gap-0.5 text-primary">{Array.from({length:5}).map((_,i)=>(<Star key={i} className="h-4 w-4 fill-current" />))}</div>
              <blockquote className="mt-4 text-lg leading-snug text-foreground">"{t.q}"</blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">{t.n} — {t.r}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
          <p className="text-sm text-muted-foreground">Pricing</p>
          <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">Free to start. Go Premium for ₦4,500/mo.</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Unlock custom themes, deeper analytics and streak freezes so a bad day never breaks your grind.</p>
          <Link to="/pricing" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">See pricing</Link>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-8 shadow-soft md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Got questions?</h2>
            <p className="mt-2 text-muted-foreground">Interest, security, withdrawals, KYC — we've got answers.</p>
          </div>
          <Link to="/faq" className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent">Read the FAQ</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-10 text-center text-primary-foreground md:p-16">
          <h2 className="font-display text-4xl md:text-5xl">Your streak starts today.</h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/70">Install SnapPots straight to your home screen — no app store, no stress.</p>
          <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground shadow-elevated hover:opacity-90">
            <Smartphone className="h-4 w-4" /> Get started free
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">*Yields are indicative and not guaranteed; rates vary by Pot type and are subject to change.</p>
      </section>
    </MarketingShell>
  );
}
