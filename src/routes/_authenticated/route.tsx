import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!isSupabaseConfigured()) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
      return { user: data.user };
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
  },
  component: () => <Outlet />,
});
