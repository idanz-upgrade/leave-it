'use client'

import { Home, BarChart2, Users, BookOpen, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'

const tabs = [
  { id: 'base' as const, label: 'בית', icon: Home },
  { id: 'insights' as const, label: 'תובנות', icon: BarChart2 },
  { id: 'community' as const, label: 'קהילה', icon: Users },
  { id: 'resources' as const, label: 'משאבים', icon: BookOpen },
  { id: 'profile' as const, label: 'פרופיל', icon: User },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #2a2a2a',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '64px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                flex: 1,
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                transition: 'all 0.2s',
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  style={{ color: isActive ? '#f97316' : '#6b7280' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span style={{
                fontSize: '10px',
                fontFamily: 'Rubik, sans-serif',
                color: isActive ? '#f97316' : '#6b7280',
                fontWeight: isActive ? 600 : 400,
              }}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '32px',
                    height: '2px',
                    background: '#f97316',
                    borderRadius: '0 0 2px 2px',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
