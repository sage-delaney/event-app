import { createBrowserSupabaseClient } from './supabase/client'

// For backward compatibility, export the browser client as 'supabase'
export const supabase = createBrowserSupabaseClient()

export type Database = any // Define your database types here
