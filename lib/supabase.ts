import { createClient } from "@supabase/supabase-js";

export type Article = {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  slug: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Service-role client — server only, never import in client components. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServiceClient(): ReturnType<typeof createClient<any>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in production."
    );
  }
  return createClient(url, serviceRoleKey);
}

/** Anon client — safe for public server components (RLS enforced). */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase public configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in production."
    );
  }
  return createClient(url, anonKey);
}
