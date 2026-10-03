import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { useNotifications } from "@/lib/pots";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — SnapPots" },
      { name: "description", content: "Streak reminders, deposits, group pot activity and interest alerts in one place." },
      { property: "og:title", content: "Notifications — SnapPots" },
      { property: "og:description", content: "Your SnapPots activity feed: streaks, deposits and group pot updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: items } = useNotifications(user.id);
  const unread = (items ?? []).filter((n) => !n.is_read);

  const markAll = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications", user.id] }),
  });

  return (
    <AppShell userId={user.id}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-primary">Alerts</h1>
        {unread.length > 0 && (
          <button onClick={() => markAll.mutate()} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {items && items.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {items.map((n) => (
            <li key={n.id} className={`rounded-2xl border p-4 ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <p className="text-sm font-semibold">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
              <p className="mt-2 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 font-display text-2xl text-primary">Nothing yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Save into a pot and your streak alerts will show up here.</p>
        </div>
      )}
    </AppShell>
  );
}
