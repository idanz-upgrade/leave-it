import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts, Rubik_400Regular, Rubik_700Bold, Rubik_800ExtraBold } from '@expo-google-fonts/rubik'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { Platform } from 'react-native'
import { useStore } from '@/lib/store'
import { initNotifications, scheduleMilestoneNotification } from '@/lib/notifications'
import { upsertLeaderboard } from '@/lib/leaderboard'

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {})
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
    Rubik_800ExtraBold,
  })

  const { onboardingCompleted, onboardingData, currentStreak, totalCleanDays } = useStore()

  // Init daily reminders once onboarding is done
  useEffect(() => {
    if (Platform.OS === 'web' || !onboardingCompleted) return
    initNotifications(onboardingData?.dangerTime).catch(() => {})
  }, [onboardingCompleted])

  // Fire milestone notification when streak hits 7 / 30 / 90
  useEffect(() => {
    if (Platform.OS === 'web' || currentStreak === 0) return
    scheduleMilestoneNotification(currentStreak).catch(() => {})
  }, [currentStreak])

  // Sync streak to Supabase leaderboard whenever it changes
  useEffect(() => {
    if (Platform.OS === 'web' || !onboardingCompleted) return
    upsertLeaderboard(currentStreak, totalCleanDays).catch(() => {})
  }, [currentStreak, onboardingCompleted])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync().catch(() => {})
      }
    }
  }, [fontsLoaded, fontError])

  // On web: render even if fonts aren't loaded yet (use system fonts as fallback)
  // On native: wait for fonts before rendering
  if (Platform.OS !== 'web' && !fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }} />
    </GestureHandlerRootView>
  )
}
