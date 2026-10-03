import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Home, LogOut, Plus, User, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogoLockup } from "@/components/logo";
import { useCurrency } from "@/lib/currency";
import { useNotifications, useProfile } from "@/lib/pots";
import { useNotificationPopups } from "@/lib/browser-notifications";
import { PwaInstallBanner } from "@/components/pwa-install-banner";

export function AppShell({ userId, children }: { userId: string; children: ReactNode }) {
  const { currency, toggle } = useCurrency();
  const navigate = useNavigate();
  const { data: profile } = useProfile(userId);
  const { data: notifications } = useNotifications(userId);
  const unread = (notifications ?? []).filter((n) => !n.is_read).length;
  useNotificationPopups(notifications);
  const streak = profile?.streak_count ?? 0;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/dashboard"><LogoLockup /></Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-flame/40 bg-flame/10 px-2.5 py-1 text-xs font-semibold text-flame">
              🔥 {streak}
            </span>
            <button
              onClick={toggle}
              className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              aria-label="Toggle currency"
            >
              {currency}
            </button>
            <Link to="/notifications" className="relative rounded-full border border-border p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <button onClick={signOut} className="hidden rounded-full border border-border p-2 hover:bg-accent md:inline-flex" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <PwaInstallBanner />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur safe-bottom">
        <div className="mx-auto flex max-w-md items-end justify-around px-4 pt-2">
          <Tab to="/dashboard" icon={Home} label="Home" />
          <Tab to="/pots" icon={Wallet} label="Pots" />
          <Link
            to="/pots"
            search={{ new: true }}
            aria-label="Create pot"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground snap-glow"
          >
            <Plus className="h-6 w-6" />
          </Link>
          <Tab to="/notifications" icon={Bell} label="Alerts" badge={unread} />
          <Tab to="/profile" icon={User} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function Tab({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors [&.active]:text-primary"
    >
      <Icon className="h-5 w-5" />
      {label}
      {!!badge && badge > 0 && (
        <span className="absolute right-1.5 top-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </Link>
  );
}
