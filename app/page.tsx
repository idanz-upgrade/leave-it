'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import MainApp from '@/components/layout/MainApp'

export default function Home() {
  const { onboardingCompleted, lastTaskDate, resetDailyTasks } = useStore()

  useEffect(() => {
    // Check if new day and reset tasks / increment streak
    const today = new Date().toISOString().split('T')[0]
    if (lastTaskDate && lastTaskDate !== today) {
      resetDailyTasks()
    }
  }, [lastTaskDate, resetDailyTasks])

  if (!onboardingCompleted) {
    return <OnboardingFlow />
  }

  return <MainApp />
}
