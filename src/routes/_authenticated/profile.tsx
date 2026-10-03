import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, BellRing, Flame, LogOut, ShieldCheck, ShieldAlert, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useCurrency } from "@/lib/currency";
import { usePots, useProfile, useWallet } from "@/lib/pots";
import { enableBrowserNotifications, notificationStatus } from "@/lib/browser-notifications";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SnapPots" },
      { name: "description", content: "Your SnapPots profile: streak record, verification tier, wallet and flex card." },
      { property: "og:title", content: "Profile — SnapPots" },
      { property: "og:description", content: "Track your savings streak, tier limits and total saved on SnapPots." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { currency, toggle, format } = useCurrency();
  const { data: profile } = useProfile(user.id);
  const { data: wallet } = useWallet(user.id);
  const { data: pots } = usePots(user.id);
  const [pushState, setPushState] = useState<string>("default");

  useEffect(() => setPushState(notificationStatus()), []);

  async function enablePush() {
    const result = await enableBrowserNotifications();
    setPushState(result);
    if (result === "granted") toast.success("Device alerts on — we'll nudge you when your streak is at risk");
    else if (result === "open-in-new-tab") toast.info("Open SnapPots in its own browser tab to turn on device alerts");
    else if (result === "unsupported") toast.error("This browser can't show device alerts");
    else toast.error("Alerts are blocked. Allow notifications for SnapPots in your browser settings.");
  }

  const totalSaved = (pots ?? []).reduce((s, p) => s + Number(p.current_amount), 0);
  const verified = (profile?.kyc_level ?? 0) >= 1 && profile?.kyc_status === "approved";

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <AppShell userId={user.id}>
      <h1 className="font-display text-3xl text-primary">Profile</h1>

      <div className="mt-5 rounded-3xl border border-border bg-card p-6">
        <p className="text-lg font-semibold">{profile?.full_name ?? user.email}</p>
        <p className="text-xs text-muted-foreground">@{profile?.username ?? user.email?.split("@")[0]}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Streak" value={`🔥 ${profile?.streak_count ?? 0}`} />
          <Stat label="Best" value={`${profile?.longest_streak ?? 0}d`} />
          <Stat label="Saved" value={format(totalSaved)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {verified ? (
          <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            <ShieldCheck className="h-4 w-4" /> Tier 1 verified
          </div>
        ) : (
          <Link to="/kyc" className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
            <ShieldAlert className="h-4 w-4" /> Verify your BVN to raise limits
          </Link>
        )}

        <Link to="/wallet" className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> Wallet</span>
          <span className="font-semibold">{format(Number(wallet?.balance ?? 0))}</span>
        </Link>

        <button onClick={toggle} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4" /> Display currency</span>
          <span className="font-semibold">{currency}</span>
        </button>

        <button onClick={enablePush} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2">
            {pushState === "granted" ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4" />} Device alerts
          </span>
          <span className="font-semibold text-muted-foreground">
            {pushState === "granted" ? "On" : pushState === "denied" ? "Blocked" : "Turn on"}
          </span>
        </button>

        <button onClick={signOut} className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="font-display text-xl">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
