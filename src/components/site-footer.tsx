import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Smartphone } from "lucide-react";
import { LogoMark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card text-card-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-bold text-foreground">SnapPots</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Save in Pots. Keep your streak. Flex your wins. The gamified way young Nigerians save.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
              <Lock className="h-3 w-3" /> Bank-grade encryption
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
              <ShieldCheck className="h-3 w-3" /> NDPR compliant
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
              <Smartphone className="h-3 w-3" /> Installable PWA
            </span>
          </div>
        </div>
        <FooterCol title="Product" links={[
          ["/how-it-works", "How it works"],
          ["/interest-rates", "Interest rates"],
          ["/pricing", "Pricing"],
          ["/security", "Security"],
          ["/verification", "Identity verification"],
        ]} />
        <FooterCol title="Company" links={[
          ["/faq", "FAQ"],
          ["/terms", "Terms of service"],
          ["/privacy", "Privacy policy"],
        ]} />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Get in touch</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>support@snappots.ng</li>
            <li>+234 700 SNAP POT</li>
            <li>Lagos, Nigeria</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SnapPots, operated by SaveSphere Ltd. Customer funds are held in trust with licensed Microfinance Bank partners.</p>
          <p>SnapPots operates via a BaaS partnership with licensed Microfinance Banks and NIBSS-connected payment processors.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
