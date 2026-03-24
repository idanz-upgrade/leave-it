// Supabase client - ready for connection
// Add your Supabase credentials to .env.local:
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Placeholder until @supabase/supabase-js is installed
export const supabase = null as any

export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey)

// Database types
export interface DBUser {
  id: string
  email: string
  created_at: string
  onboarding_data: Record<string, unknown>
  current_streak: number
  longest_streak: number
  xp: number
  level: number
  last_checkin: string | null
  last_slipup: string | null
  preferred_language_style: 'secular' | 'religious'
}

export interface DBHabit {
  id: string
  user_id: string
  title: string
  category: 'morning' | 'anytime' | 'evening'
  is_completed: boolean
  date: string
  xp_earned: number
}

export interface DBCheckin {
  id: string
  user_id: string
  mood: number
  temptation_level: number
  triggers: string[]
  notes: string
  created_at: string
}

export interface DBSetback {
  id: string
  user_id: string
  trigger: string
  notes: string
  created_at: string
}
