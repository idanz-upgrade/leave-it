import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const STORAGE_KEY = 'notification_ids'

// Maps onboarding dangerTime values → hour
const DANGER_HOUR: Record<string, number> = {
  'בוקר':        8,
  'צהריים':      13,
  'ערב':         19,
  'לילה מאוחר': 22,
}

const MILESTONES: Record<number, { title: string; body: string }> = {
  7:  { title: 'שבוע שלם! 🧠',  body: 'המוח שלך כבר משתנה. תמשיך ככה.' },
  30: { title: '30 יום! 🏆',    body: 'אתה לא אותו אדם שהתחיל. כל הכבוד.' },
  90: { title: '90 יום 🌱',     body: 'זה כבר חלק ממי שאתה.' },
}

// ── Notification handler (must be at module level) ───────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
})

// ── AsyncStorage helpers ─────────────────────────────────────────────────────
async function getIds(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

async function setId(key: string, id: string): Promise<void> {
  const ids = await getIds()
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...ids, [key]: id }))
}

async function cancelExisting(key: string): Promise<void> {
  const ids = await getIds()
  if (ids[key]) {
    await Notifications.cancelScheduledNotificationAsync(ids[key]).catch(() => {})
  }
}

// ── Permissions ──────────────────────────────────────────────────────────────
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'שליטה',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    })
  }
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// ── Schedule helpers ─────────────────────────────────────────────────────────
async function scheduleDaily(
  key: string,
  title: string,
  body: string,
  hour: number,
  minute = 0,
): Promise<void> {
  await cancelExisting(key)
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { hour, minute, repeats: true } as any,
  })
  await setId(key, id)
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Daily check-in reminder at 21:00 */
export async function scheduleCheckinReminder(): Promise<void> {
  await scheduleDaily(
    'checkin',
    'איך היה היום?',
    '30 שניות לתעד את היום שלך 🔥',
    21,
  )
}

/** Personal danger-time reminder based on onboarding answer */
export async function scheduleDangerTimeReminder(dangerTime: string): Promise<void> {
  const hour = DANGER_HOUR[dangerTime]
  if (hour === undefined) return
  await scheduleDaily(
    'danger',
    'שעת סיכון — אתה לא לבד',
    'הדחף יעבור. פתח את האפליקציה 💪',
    hour,
  )
}

/** One-time milestone notification — fires 3 seconds after call, never duplicated */
export async function scheduleMilestoneNotification(streak: number): Promise<void> {
  const msg = MILESTONES[streak]
  if (!msg) return

  const key = `milestone_${streak}`
  const ids = await getIds()
  if (ids[key]) return // already sent for this milestone

  const id = await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body },
    trigger: { seconds: 3 } as any,
  })
  await setId(key, id)
}

/** Called once on app launch (after onboarding complete) */
export async function initNotifications(dangerTime?: string): Promise<void> {
  if (Platform.OS === 'web') return

  const granted = await requestPermissions()
  if (!granted) return

  await scheduleCheckinReminder()
  if (dangerTime) await scheduleDangerTimeReminder(dangerTime)
}
