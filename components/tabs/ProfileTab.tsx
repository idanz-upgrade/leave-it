'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Bell, Shield, ChevronLeft, AlertCircle } from 'lucide-react'
import { useStore, LEVEL_REQUIREMENTS } from '@/lib/store'

const MILESTONES = [
  { label: '7 ימים', target: 7, icon: '🌱' },
  { label: '30 יום', target: 30, icon: '🌿' },
  { label: '90 יום', target: 90, icon: '🌳' },
  { label: '100 משימות', target: 100, icon: '💯', isTask: true },
]

export default function ProfileTab() {
  const {
    currentStreak, level, xp, onboardingData,
    tasks, setbacks, logout, completeOnboarding,
  } = useStore()
  const [editingWhy, setEditingWhy] = useState(false)
  const [whyText, setWhyText] = useState(onboardingData?.yourWhy || '')
  const [showDanger, setShowDanger] = useState(false)

  const levelInfo = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const totalTasksCompleted = tasks.filter(t => t.isCompleted).length

  const handleSaveWhy = () => {
    if (onboardingData) {
      completeOnboarding({ ...onboardingData, yourWhy: whyText })
    }
    setEditingWhy(false)
  }

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leave-it-storage')
      window.location.reload()
    }
  }

  return (
    <div style={{ padding: '0 0 100px' }}>
      <div style={{
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
          פרופיל
        </h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Profile header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #111)',
          borderRadius: '16px', border: '1px solid #2a2a2a', padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
          }}>
            💪
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
            לוחם אנונימי
          </div>
          <div style={{ fontSize: '13px', color: '#f97316', marginTop: '4px', fontFamily: 'Rubik, sans-serif', fontWeight: 600 }}>
            רמה {level} — {levelInfo?.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{currentStreak}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>ימי Streak</div>
            </div>
            <div style={{ width: '1px', background: '#2a2a2a' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{xp.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>XP</div>
            </div>
            <div style={{ width: '1px', background: '#2a2a2a' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{totalTasksCompleted}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>משימות</div>
            </div>
          </div>
        </div>

        {/* Your Why */}
        <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              onClick={() => setEditingWhy(!editingWhy)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
            >
              <Edit3 size={16} />
            </button>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif' }}>
              ההתחייבות שלי
            </h3>
          </div>
          {editingWhy ? (
            <>
              <textarea
                value={whyText}
                onChange={e => setWhyText(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: '1px solid #f97316', background: '#111',
                  color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif',
                  resize: 'none', outline: 'none', direction: 'rtl', marginBottom: '8px',
                }}
              />
              <button onClick={handleSaveWhy} style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: '#f97316', color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: 700, fontFamily: 'Rubik, sans-serif', cursor: 'pointer',
              }}>
                שמור
              </button>
            </>
          ) : (
            <p style={{
              margin: 0, fontSize: '15px', color: onboardingData?.yourWhy ? '#f5f5f5' : '#3a3a3a',
              fontFamily: 'Rubik, sans-serif', lineHeight: 1.6, textAlign: 'right', fontStyle: 'italic',
            }}>
              {onboardingData?.yourWhy || 'הוסף את הסיבה שלך...'}
            </p>
          )}
        </div>

        {/* Milestones */}
        <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right', letterSpacing: '1px' }}>
            הישגים
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {MILESTONES.map(m => {
              const current = m.isTask ? totalTasksCompleted : currentStreak
              const pct = Math.min((current / m.target) * 100, 100)
              const done = current >= m.target
              return (
                <div key={m.label} style={{
                  background: done ? 'rgba(34,197,94,0.1)' : '#111',
                  borderRadius: '10px',
                  border: `1px solid ${done ? '#22c55e' : '#222'}`,
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{m.icon}</div>
                  <div style={{ fontSize: '12px', color: done ? '#22c55e' : '#6b7280', fontFamily: 'Rubik, sans-serif', fontWeight: 600 }}>
                    {m.label}
                  </div>
                  <div style={{ background: '#222', borderRadius: '99px', height: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: done ? '#22c55e' : '#f97316', borderRadius: '99px', width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '4px', fontFamily: 'Rubik, sans-serif' }}>
                    {current}/{m.target}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reminders */}
        <div style={{
          background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Bell size={18} color="#6b7280" />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>תזכורות חכמות</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>בקרוב</div>
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
          {[
            { label: 'מדיניות פרטיות', icon: '🔒' },
            { label: 'תנאי שימוש', icon: '📄' },
            { label: 'צור קשר עם תמיכה', icon: '💬' },
          ].map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
              borderBottom: i < 2 ? '1px solid #1f1f1f' : 'none',
            }}>
              <ChevronLeft size={16} color="#3a3a3a" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{item.label}</span>
                <span>{item.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div>
          <button
            onClick={() => setShowDanger(!showDanger)}
            style={{
              width: '100%', padding: '12px',
              background: 'none', border: '1px solid #2a2a2a',
              borderRadius: '10px', color: '#6b7280', fontSize: '13px',
              fontFamily: 'Rubik, sans-serif', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <AlertCircle size={14} />
            אזור מסוכן
          </button>

          {showDanger && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.05)', borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.2)', padding: '16px', marginTop: '8px',
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  padding: '12px', borderRadius: '8px',
                  background: 'none', border: '1px solid #ef4444',
                  color: '#ef4444', fontSize: '14px', fontFamily: 'Rubik, sans-serif', cursor: 'pointer',
                }}
              >
                איפוס כל ההתקדמות
              </button>
            </motion.div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#2a2a2a', fontSize: '12px', fontFamily: 'Rubik, sans-serif' }}>
          גרסה 1.0.0 — שליטה
        </p>
      </div>
    </div>
  )
}
