'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, TrendingUp, CheckSquare, Activity, X, Lock } from 'lucide-react'
import { useStore } from '@/lib/store'

const MOODS = ['😔', '😕', '😐', '🙂', '😄']
const COMMON_TRIGGERS = ['שעמום', 'לחץ', 'עייפות', 'בדידות', 'כעס', 'אחר']

function StreakDisplay({ streak, longestStreak }: { streak: number; longestStreak: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a, #111)',
      borderRadius: '20px',
      border: '1px solid #2a2a2a',
      padding: '32px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: streak > 0
          ? 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)'
          : 'none',
        pointerEvents: 'none',
      }} />

      <motion.div
        animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: '56px', marginBottom: '8px' }}
      >
        {streak > 0 ? '🔥' : '💧'}
      </motion.div>

      <div style={{ position: 'relative' }}>
        <motion.div
          key={streak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: streak > 0 ? '#f97316' : '#6b7280',
            lineHeight: 1,
            fontFamily: 'Rubik, sans-serif',
          }}
        >
          {streak}
        </motion.div>
        <div style={{ fontSize: '18px', color: '#a3a3a3', marginTop: '8px', fontFamily: 'Rubik, sans-serif', fontWeight: 500 }}>
          {streak === 1 ? 'יום נקי' : 'ימים נקיים'}
        </div>
        {longestStreak > 0 && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontFamily: 'Rubik, sans-serif' }}>
            שיא אישי: {longestStreak} ימים
          </div>
        )}
      </div>
    </div>
  )
}

function MetricsRow({ resilience, tasksCompleted, checkinsCount }: {
  resilience: number
  tasksCompleted: number
  checkinsCount: number
}) {
  const metrics = [
    { label: 'חוסן', value: resilience, icon: '🧱', desc: 'לא מתאפס' },
    { label: 'משימות', value: tasksCompleted, icon: '✅', desc: '' },
    { label: "צ'ק-אין", value: checkinsCount, icon: '📊', desc: '' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          background: '#1a1a1a',
          borderRadius: '14px',
          border: '1px solid #2a2a2a',
          padding: '16px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{m.icon}</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>{m.value}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>{m.label}</div>
          {m.desc && <div style={{ fontSize: '10px', color: '#3a3a3a', fontFamily: 'Rubik, sans-serif' }}>{m.desc}</div>}
        </div>
      ))}
    </div>
  )
}

function CheckinModal({ onClose }: { onClose: () => void }) {
  const { addCheckin } = useStore()
  const [mood, setMood] = useState(3)
  const [temptation, setTemptation] = useState(1)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const toggleTrigger = (t: string) => {
    setSelectedTriggers(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const handleSubmit = () => {
    addCheckin({ mood, temptationLevel: temptation, triggers: selectedTriggers, notes })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a', borderRadius: '20px 20px 0 0',
          padding: '24px', width: '100%',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <h3 style={{ margin: 0, fontFamily: 'Rubik, sans-serif', color: '#f5f5f5', fontSize: '18px', fontWeight: 700 }}>
            צ&#39;ק-אין יומי
          </h3>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#a3a3a3', fontSize: '14px', fontFamily: 'Rubik, sans-serif', marginBottom: '12px', textAlign: 'right' }}>
            איך אתה מרגיש?
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {MOODS.map((emoji, i) => (
              <button key={i} onClick={() => setMood(i + 1)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: mood === i + 1 ? '36px' : '28px',
                transition: 'all 0.2s',
                filter: mood === i + 1 ? 'none' : 'grayscale(0.5) opacity(0.5)',
              }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#a3a3a3', fontSize: '14px', fontFamily: 'Rubik, sans-serif', marginBottom: '12px', textAlign: 'right' }}>
            רמת פיתוי היום: {temptation}/5
          </p>
          <input type="range" min={1} max={5} value={temptation}
            onChange={e => setTemptation(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#a3a3a3', fontSize: '14px', fontFamily: 'Rubik, sans-serif', marginBottom: '12px', textAlign: 'right' }}>
            טריגרים?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
            {COMMON_TRIGGERS.map(t => (
              <button key={t} onClick={() => toggleTrigger(t)} style={{
                padding: '8px 14px',
                borderRadius: '99px',
                border: `1px solid ${selectedTriggers.includes(t) ? '#f97316' : '#333'}`,
                background: selectedTriggers.includes(t) ? 'rgba(249,115,22,0.15)' : '#111',
                color: selectedTriggers.includes(t) ? '#f97316' : '#a3a3a3',
                fontSize: '13px',
                fontFamily: 'Rubik, sans-serif',
                cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="הערות נוספות (אופציונלי)..."
          rows={3}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: '1px solid #333', background: '#111',
            color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif',
            resize: 'none', outline: 'none', direction: 'rtl', marginBottom: '20px',
          }}
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px',
            background: '#f97316', color: '#fff', border: 'none',
            fontSize: '16px', fontWeight: 700, fontFamily: 'Rubik, sans-serif', cursor: 'pointer',
          }}
        >
          שמור +25 XP
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function SetbackModal({ onClose }: { onClose: () => void }) {
  const { reportSetback } = useStore()
  const [trigger, setTrigger] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = () => {
    if (!confirmed) { setConfirmed(true); return }
    reportSetback(trigger, notes)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 100, display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a', borderRadius: '20px 20px 0 0',
          padding: '24px', width: '100%',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <h3 style={{ margin: 0, fontFamily: 'Rubik, sans-serif', color: '#ef4444', fontSize: '18px', fontWeight: 700 }}>
            תיעוד נפילה
          </h3>
        </div>

        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ color: '#f87171', fontSize: '15px', fontFamily: 'Rubik, sans-serif', margin: 0, lineHeight: 1.6, textAlign: 'right' }}>
            💪 החלמה אינה ליניארית. כל נפילה היא הזדמנות ללמוד ולחזור חזק יותר.
          </p>
        </div>

        <input
          type="text"
          value={trigger}
          onChange={e => setTrigger(e.target.value)}
          placeholder="מה גרם לנפילה? (שעמום, לחץ, עייפות...)"
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: '1px solid #333', background: '#111',
            color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif',
            direction: 'rtl', outline: 'none', marginBottom: '12px',
          }}
        />

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="הערות..."
          rows={3}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: '1px solid #333', background: '#111',
            color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif',
            resize: 'none', outline: 'none', direction: 'rtl', marginBottom: '20px',
          }}
        />

        {confirmed ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              background: '#ef4444', color: '#fff', border: 'none',
              fontSize: '16px', fontWeight: 700, fontFamily: 'Rubik, sans-serif', cursor: 'pointer',
            }}
          >
            אישור — אפס את ה-Streak
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              background: '#2a2a2a', color: '#ef4444', border: '1px solid #ef4444',
              fontSize: '16px', fontWeight: 700, fontFamily: 'Rubik, sans-serif', cursor: 'pointer',
            }}
          >
            הייתה לי נפילה
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function InsightsTab() {
  const { currentStreak, longestStreak, resilience, checkins, tasks, xp } = useStore()
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [setbackOpen, setSetbackOpen] = useState(false)

  const tasksCompleted = tasks.filter(t => t.isCompleted).length
  const checkinsCount = checkins.length
  const patternUnlockIn = Math.max(0, 7 - checkinsCount)

  return (
    <div style={{ padding: '0 0 100px' }}>
      <div style={{
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
          תובנות
        </h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <StreakDisplay streak={currentStreak} longestStreak={longestStreak} />

        <MetricsRow resilience={resilience} tasksCompleted={tasksCompleted} checkinsCount={checkinsCount} />

        {/* Daily Check-In */}
        <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCheckinOpen(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Rubik, sans-serif',
                cursor: 'pointer',
              }}
            >
              + צ&#39;ק-אין
            </motion.button>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
                צ&#39;ק-אין יומי
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>30 שניות לתיעוד היום</div>
            </div>
          </div>
        </div>

        {/* Patterns */}
        <div style={{
          background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px',
          opacity: patternUnlockIn > 0 ? 0.6 : 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            {patternUnlockIn > 0 && <Lock size={16} color="#6b7280" />}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
                זיהוי דפוסים
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>
                {patternUnlockIn > 0 ? `נפתח בעוד ${patternUnlockIn} צ'ק-אינים` : 'פתוח!'}
              </div>
            </div>
          </div>
          {patternUnlockIn > 0 && (
            <>
              <div style={{ background: '#111', borderRadius: '8px', height: '6px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{
                  height: '100%',
                  background: '#f97316',
                  borderRadius: '8px',
                  width: `${(checkinsCount / 7) * 100}%`,
                  transition: 'width 0.3s',
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#3a3a3a', textAlign: 'left', marginTop: '4px', fontFamily: 'Rubik, sans-serif' }}>
                {checkinsCount}/7
              </div>
            </>
          )}
        </div>

        {/* Setbacks */}
        <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSetbackOpen(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Rubik, sans-serif',
                cursor: 'pointer',
              }}
            >
              הייתה לי נפילה
            </motion.button>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
                SETBACKS
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>תעד כדי לצמוח</div>
            </div>
          </div>
        </div>

        {/* Recent check-ins */}
        {checkins.length > 0 && (
          <div style={{ background: '#1a1a1a', borderRadius: '14px', border: '1px solid #2a2a2a', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', textAlign: 'right' }}>
              צ&#39;ק-אינים אחרונים
            </h3>
            {checkins.slice(0, 3).map(ci => (
              <div key={ci.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #222',
              }}>
                <span style={{ fontSize: '11px', color: '#3a3a3a', fontFamily: 'Rubik, sans-serif' }}>
                  {new Date(ci.createdAt).toLocaleDateString('he-IL')}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{MOODS[ci.mood - 1]}</span>
                  {ci.triggers.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>
                      {ci.triggers.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {checkinOpen && <CheckinModal onClose={() => setCheckinOpen(false)} />}
        {setbackOpen && <SetbackModal onClose={() => setSetbackOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
