import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vite bakes these in at build time, so a missing one means the host (Vercel) lacks the variable.
// Report it instead of throwing here, which would blank the whole site rather than just card checkout.
const missing = [!supabaseUrl && 'VITE_SUPABASE_URL', !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY'].filter(Boolean)
export const supabaseConfigError = missing.length
  ? `Card payments are not configured: ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} missing from this build.`
  : null
if (supabaseConfigError) console.error(supabaseConfigError)

export const supabase = supabaseConfigError ? null : createClient(supabaseUrl, supabaseAnonKey)
