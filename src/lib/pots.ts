import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PotType = "solo" | "group" | "flex";

export const POT_META: Record<PotType, { label: string; blurb: string; emoji: string }> = {
  solo: { label: "Solo target", blurb: "Locked until maturity. Break early and pay a penalty.", emoji: "🎯" },
  group: { label: "Group (Ajo)", blurb: "Save with your squad. Invite code + live leaderboard.", emoji: "👯" },
  flex: { label: "Flex", blurb: "Instant access. Withdraw anytime, no penalty.", emoji: "⚡" },
};

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()).data,
  });
}

export function useWallet(userId: string) {
  return useQuery({
    queryKey: ["wallet", userId],
    queryFn: async () => (await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()).data,
  });
}

export function usePots(userId: string) {
  return useQuery({
    queryKey: ["pots", userId],
    queryFn: async () =>
      (await supabase.from("savings_goals").select("*").order("created_at", { ascending: false })).data ?? [],
  });
}

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () =>
      (
        await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)
      ).data ?? [],
    refetchInterval: 30_000,
  });
}

export function potProgress(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

export function isLocked(lockUntil: string | null) {
  if (!lockUntil) return false;
  return new Date(lockUntil) > new Date();
}
