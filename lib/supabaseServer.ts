import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with admin privileges.
 * This uses the SERVICE_ROLE_KEY and should NEVER be imported by client components.
 * Only use this in API routes, server components, or server-side functions.
 */
export function getServerSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL environment variable. Please add it to your .env.local file.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please add it to your .env.local file.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Type-safe helper to check if we're in a server environment
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}
