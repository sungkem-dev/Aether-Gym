/**
 * supabaseClient.ts — Frontend Supabase client (Browser-side)
 *
 * Uses the PUBLIC anon key (safe to expose in the browser).
 * Auth sessions are managed automatically by the Supabase JS client.
 *
 * Setup: Add these two variables to a .env file in the project root:
 *   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * Get them from: Supabase Dashboard → Settings → API
 * The "anon" key is the safe public key (NOT the service_role key).
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
