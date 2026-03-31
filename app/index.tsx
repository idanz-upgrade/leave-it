import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useStore } from '@/lib/store'

export default function Index() {
  const { onboardingCompleted, startNewDay } = useStore()

  useEffect(() => {
    startNewDay()
    if (onboardingCompleted) {
      router.replace('/(tabs)')
    } else {
      router.replace('/onboarding')
    }
  }, [onboardingCompleted])

  return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />
}
