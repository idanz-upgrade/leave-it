import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '@/lib/store'

export default function Index() {
  const { onboardingCompleted, lastTaskDate, resetDailyTasks } = useStore()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (lastTaskDate && lastTaskDate !== today) resetDailyTasks()
    if (onboardingCompleted) {
      router.replace('/(tabs)')
    } else {
      router.replace('/onboarding')
    }
  }, [onboardingCompleted])

  return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />
}
