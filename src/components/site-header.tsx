import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LogoLockup } from "@/components/logo";

const nav = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/interest-rates", label: "Interest" },
  { to: "/security", label: "Security" },
  { to: "/verification", label: "Verification" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/"><LogoLockup /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <Link to="/dashboard" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
                Start a Pot
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm hover:bg-accent">
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {signedIn ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">Dashboard</Link>
              ) : (
                <>
                  <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)} className="flex-1 rounded-full border border-border px-4 py-2 text-center text-sm">Sign in</Link>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">Start a Pot</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
