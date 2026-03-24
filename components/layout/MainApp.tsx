'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import BottomNav from './BottomNav'
import BaseTab from '@/components/tabs/BaseTab'
import InsightsTab from '@/components/tabs/InsightsTab'
import CommunityTab from '@/components/tabs/CommunityTab'
import ResourcesTab from '@/components/tabs/ResourcesTab'
import ProfileTab from '@/components/tabs/ProfileTab'

const tabComponents = {
  base: BaseTab,
  insights: InsightsTab,
  community: CommunityTab,
  resources: ResourcesTab,
  profile: ProfileTab,
}

export default function MainApp() {
  const { activeTab } = useStore()
  const ActiveComponent = tabComponents[activeTab]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: '80px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
