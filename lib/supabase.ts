import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Only create client when URL is a real HTTPS URL (not a placeholder)
const isConfigured = url.startsWith('https://') && key.length > 20

export const supabase = isConfigured
  ? createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null as any
