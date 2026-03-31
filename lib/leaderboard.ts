import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

const ANON_ID_KEY   = 'lb_anon_id'
const DISPLAY_NAME_KEY = 'lb_display_name'
const CACHE_KEY     = 'lb_cache'

const HEBREW = 'אבגדהוזחטיכלמנסעפצקרשת'

function makeUUID(): string {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1)
  return `${s4()}${s4()}-${s4()}-4${s4().slice(1)}-${s4()}-${s4()}${s4()}${s4()}`
}

function randomHebrewInitials(): string {
  const a = HEBREW[Math.floor(Math.random() * HEBREW.length)]
  const b = HEBREW[Math.floor(Math.random() * HEBREW.length)]
  return `${a}.${b}`
}

export async function getOrCreateAnonymousId(): Promise<string> {
  let id = await AsyncStorage.getItem(ANON_ID_KEY)
  if (!id) {
    id = makeUUID()
    await AsyncStorage.setItem(ANON_ID_KEY, id)
  }
  return id
}

export async function getOrCreateDisplayName(): Promise<string> {
  let name = await AsyncStorage.getItem(DISPLAY_NAME_KEY)
  if (!name) {
    name = randomHebrewInitials()
    await AsyncStorage.setItem(DISPLAY_NAME_KEY, name)
  }
  return name
}

export interface LeaderboardEntry {
  anonymous_id: string
  display_name: string
  streak: number
  total_clean_days: number
}

export async function upsertLeaderboard(streak: number, totalCleanDays: number): Promise<void> {
  try {
    const [anonymousId, displayName] = await Promise.all([
      getOrCreateAnonymousId(),
      getOrCreateDisplayName(),
    ])
    await supabase.from('leaderboard').upsert(
      {
        anonymous_id: anonymousId,
        display_name: displayName,
        streak,
        total_clean_days: totalCleanDays,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'anonymous_id' }
    )
  } catch {
    // Silent fail — offline
  }
}

export async function fetchTop10(): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('anonymous_id, display_name, streak, total_clean_days')
      .order('streak', { ascending: false })
      .limit(10)

    if (error || !data) throw new Error(error?.message)

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data))
    return data as LeaderboardEntry[]
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_KEY)
    if (cached) return JSON.parse(cached) as LeaderboardEntry[]
    return []
  }
}

export async function fetchMyRank(anonymousId: string, streak: number): Promise<number> {
  try {
    const { count } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('streak', streak)
    return (count ?? 0) + 1
  } catch {
    return 0
  }
}
