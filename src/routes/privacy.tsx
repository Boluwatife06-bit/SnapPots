import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SnapPots" },
      { name: "description", content: "How SnapPots collects, uses and protects your personal data in line with the Nigeria Data Protection Regulation (NDPR)." },
      { property: "og:title", content: "Privacy Policy — SnapPots" },
      { property: "og:description", content: "How SnapPots protects and handles your personal data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-20">
        <p className="text-sm text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-5xl text-primary">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 25 July 2026. SnapPots is operated by SaveSphere Ltd. This page describes how we handle your data under the NDPR.</p>

        <Section title="What we collect">
          Account data (name, email, phone, BVN), KYC documents, transaction history, device information and app usage analytics.
        </Section>
        <Section title="How we use it">
          To operate your account, process transactions, verify your identity, prevent fraud, comply with CBN and NFIU rules, and improve the product.
        </Section>
        <Section title="Who we share it with">
          Our CBN-licensed partner bank, KYC providers (e.g. Sumsub/Onfido), payment processors (Paystack), analytics tools (Mixpanel), and law-enforcement agencies where legally required.
        </Section>
        <Section title="Data retention">
          We retain transaction records for at least 7 years to meet Nigerian legal requirements. KYC records are retained for 5 years after account closure.
        </Section>
        <Section title="Your rights">
          You may request access, correction, or deletion of your personal data by writing to dpo@snappots.ng. Under the NDPR, you may lodge complaints with the Nigeria Data Protection Commission.
        </Section>
        <Section title="Breach notification">
          Confirmed breaches affecting your data will be reported to you and the regulator within 72 hours.
        </Section>
        <Section title="Cookies">
          We use essential cookies for sign-in and preferences, and analytics cookies to improve the product. You can opt out of analytics cookies in Settings.
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
