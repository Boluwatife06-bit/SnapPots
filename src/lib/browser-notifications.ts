import { useEffect, useRef } from "react";

export type PushStatus = "granted" | "denied" | "unsupported" | "open-in-new-tab";

export function notificationStatus(): PushStatus | "default" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as PushStatus | "default";
}

/** Must be called from a click handler — browsers ignore permission requests without a gesture. */
export async function enableBrowserNotifications(): Promise<PushStatus> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (window.top !== window.self) return "open-in-new-tab";
  if (Notification.permission === "granted") return "granted";
  const permission = await Notification.requestPermission();
  return permission === "granted" ? "granted" : "denied";
}

type Item = { id: string; title: string; body: string | null; is_read: boolean };

/** Pops a device notification for alerts that arrive while the app is open. */
export function useNotificationPopups(items: Item[] | undefined) {
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!items) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // First pass just records what already exists — no popups for history.
    if (seen.current === null) {
      seen.current = new Set(items.map((i) => i.id));
      return;
    }
    if (Notification.permission !== "granted") {
      items.forEach((i) => seen.current?.add(i.id));
      return;
    }
    for (const item of items) {
      if (seen.current.has(item.id)) continue;
      seen.current.add(item.id);
      if (item.is_read) continue;
      try {
        new Notification(item.title, { body: item.body ?? undefined, icon: "/icon-192.png", tag: item.id });
      } catch {
        /* notification blocked */
      }
    }
  }, [items]);
}
