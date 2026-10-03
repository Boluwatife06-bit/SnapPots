import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function readSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readSupabaseConfig();
  return Boolean(url && key);
}

const notConfiguredError = () =>
  new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your environment.");

function createUnavailableClient() {
  const error = notConfiguredError();
  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
      error: null,
    }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error }),
    signUp: async () => ({ data: { user: null, session: null }, error }),
    signInWithOAuth: async () => ({ data: { user: null, session: null, url: null, provider: "google" }, error }),
    signOut: async () => ({ error: null }),
    setSession: async () => ({ data: { session: null, user: null }, error }),
  };
  return { auth } as unknown as ReturnType<typeof createClient<Database>>;
}

function createSupabaseClient() {
  const { url, key } = readSupabaseConfig();

  if (!url || !key) {
    console.warn("[Supabase] Missing environment variables. Auth and live data are disabled until they are set.");
    return createUnavailableClient();
  }

  return createClient<Database>(url, key, {
    global: {
      fetch: createSupabaseFetch(key),
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
