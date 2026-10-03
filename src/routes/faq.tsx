import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — SnapPots" },
      { name: "description", content: "Answers to common questions about SnapPots: how group savings work, interest, security, withdrawals and KYC." },
      { property: "og:title", content: "SnapPots FAQ" },
      { property: "og:description", content: "Everything you need to know about SnapPots." },
    ],
  }),
  component: FAQ,
});

const faqs = [
  { q: "What is a Pot?", a: "A Pot is a savings goal. Solo Pots are just for you, Group (Ajo) Pots let friends save together with an invite link, and Flex Pots let you withdraw anytime." },
  { q: "How do streaks work?", a: "Save into any Pot on a new day to grow your 🔥 streak. Miss a day and it resets — we'll nudge you before that happens." },
  { q: "What happens if I break a locked Pot?", a: "You can always get your money, but breaking a Pot before its unlock date costs a small penalty (usually 5%). Flex Pots have no penalty." },
  { q: "How is interest paid?", a: "Interest accrues daily on each Pot balance and is credited weekly. It compounds inside the same Pot." },
  { q: "Do I need to verify my identity?", a: "Yes, to withdraw. BVN unlocks Tier 1, NIN unlocks Tier 2, and proof of address unlocks Tier 3 with the highest limits." },
  { q: "Can I install SnapPots on my phone?", a: "Yes. Open SnapPots in your browser and tap Install (Android) or Share → Add to Home Screen (iPhone). No app store needed." },
  { q: "Is my money safe?", a: "Funds are held in trust with licensed Microfinance Bank partners. Deposits are covered by NDIC up to ₦500,000 per depositor." },
  { q: "What are the fees?", a: "Saving is free. Withdrawals to your bank cost ₦50 or 0.5% (capped at ₦1,000)." },
];

function FAQ() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">FAQ</p>
        <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">Questions? Answered.</h1>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <Accordion type="single" collapsible className="rounded-3xl border border-border bg-card p-4 shadow-soft">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-center text-sm text-muted-foreground">Still stuck? Email <strong className="text-foreground">support@snappots.ng</strong>.</p>
      </section>
    </MarketingShell>
  );
}
