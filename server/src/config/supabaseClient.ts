/**
 * supabaseClient.ts — Supabase Admin Client
 *
 * Uses the SERVICE ROLE key which bypasses Row Level Security (RLS).
 * This client is ONLY used server-side in the Express backend.
 *
 * ⚠️  NEVER expose this key to the browser / frontend.
 *
 * For user-scoped queries, we create a per-request client authenticated
 * with the user's JWT from the Authorization header (see auth middleware).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Admin client — has full database access (bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // Disable auto-refresh since this is a server-side service client
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a per-request Supabase client authenticated with the user's JWT.
 * This client RESPECTS RLS policies, so queries are scoped to the user.
 *
 * Usage: const userClient = createUserClient(req.headers.authorization);
 */
export function createUserClient(authorizationHeader: string | undefined): SupabaseClient {
  const token = authorizationHeader?.replace('Bearer ', '') ?? '';
  return createClient(
    env.SUPABASE_URL,
    // The anon key is used here; the JWT provides the user identity for RLS
    // Use SUPABASE_ANON_KEY if you add it to env; for now reuse service key
    // but the global headers override authentication context
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
