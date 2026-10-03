import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SnapPots" },
      { name: "description", content: "The terms that govern your use of SnapPots, including account rules, contributions, withdrawals and dispute resolution." },
      { property: "og:title", content: "Terms of Service — SnapPots" },
      { property: "og:description", content: "Account rules, contributions, withdrawals and dispute resolution for SnapPots." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-20">
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-5xl text-primary">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 25 July 2026. SnapPots is operated by SaveSphere Ltd. These terms explain your use of SnapPots.</p>

        <Section title="1. Who we are">
          SnapPots is operated by SaveSphere Ltd, a company incorporated in Nigeria. We operate in partnership with a CBN-licensed Microfinance Bank that holds customer funds in segregated trust accounts.
        </Section>
        <Section title="2. Your account">
          You must be at least 18 to open an account. You are responsible for maintaining the security of your login credentials, including any two-factor authentication method you enable.
        </Section>
        <Section title="3. Contributions & withdrawals">
          Contributions are voluntary. You retain ownership of amounts you contribute. Withdrawals are processed to a verified bank account in your name. Free-plan withdrawals arrive next business day; Premium withdrawals are instant, subject to bank cutoffs.
        </Section>
        <Section title="4. Interest">
          Interest rates are variable and displayed on our Interest Rates page. Rates may change on 30 days' notice. A 10% withholding tax is auto-deducted and remitted to FIRS.
        </Section>
        <Section title="5. Prohibited activity">
          You must not use SnapPots for money laundering, fraud, financing of terrorism, or any activity that violates Nigerian law. Suspicious activity may be reported to the NFIU.
        </Section>
        <Section title="6. Account termination">
          You may close your account at any time by withdrawing all funds and contacting support. We may suspend or close accounts where required by law or in cases of suspected fraud.
        </Section>
        <Section title="7. Dispute resolution">
          Disputes are first handled by our support team. Unresolved disputes are subject to the Consumer Protection Framework of the Central Bank of Nigeria.
        </Section>
        <Section title="8. Contact">
          Legal notices: legal@snappots.ng.
        </Section>
      </article>
    </MarketingShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      <p className="mt-3 text-muted-foreground">{children}</p>
    </section>
  );
}
