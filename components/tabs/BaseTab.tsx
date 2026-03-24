'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, CheckCircle2, Circle, AlertTriangle, X } from 'lucide-react'
import { useStore, Task, LEVEL_REQUIREMENTS } from '@/lib/store'

const LEVEL_EMOJIS = ['⛺', '🏕️', '🏠', '🗼', '🏰', '🏯', '🛡️', '⚔️', '👑', '🌟']

function FloatingIsland({ level }: { level: number }) {
  const emoji = LEVEL_EMOJIS[Math.min(level - 1, 9)]
  const levelInfo = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a, #111)',
      borderRadius: '20px',
      border: '1px solid #2a2a2a',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '64px', marginBottom: '12px' }}
      >
        {emoji}
      </motion.div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
          רמה {level}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
          {levelInfo?.name}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          {levelInfo?.nameEn}
        </div>
      </div>
    </div>
  )
}

function DailyProgress({ tasks }: { tasks: Task[] }) {
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.date === today || true) // show all
  const completed = todayTasks.filter(t => t.isCompleted).length
  const total = todayTasks.length
  const pct = total > 0 ? (completed / total) * 100 : 0

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '14px',
      border: '1px solid #2a2a2a',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', color: '#a3a3a3', fontFamily: 'Rubik, sans-serif' }}>
          היום: {completed}/{total} הושלמו
        </span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ background: '#2a2a2a', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '99px',
            background: pct === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #f97316, #eab308)',
          }}
        />
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid #1f1f1f',
      }}
    >
      <button
        onClick={() => toggleTask(task.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        {task.isCompleted ? (
          <CheckCircle2 size={22} color="#22c55e" strokeWidth={2} />
        ) : (
          <Circle size={22} color="#3a3a3a" strokeWidth={2} />
        )}
      </button>

      <span style={{ fontSize: '16px', marginLeft: '4px', flexShrink: 0 }}>{task.icon}</span>

      <span style={{
        flex: 1,
        fontSize: '15px',
        color: task.isCompleted ? '#4a4a4a' : '#f5f5f5',
        textDecoration: task.isCompleted ? 'line-through' : 'none',
        fontFamily: 'Rubik, sans-serif',
        transition: 'all 0.2s',
      }}>
        {task.title}
      </span>

      {task.isCompleted && (
        <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>+50 XP</span>
      )}

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#3a3a3a' }}
        >
          <MoreVertical size={16} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                left: 0,
                top: '28px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '4px',
                zIndex: 10,
                minWidth: '120px',
              }}
            >
              <button
                onClick={() => { deleteTask(task.id); setMenuOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '14px',
                  fontFamily: 'Rubik, sans-serif',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
              >
                מחק משימה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function AddTaskModal({
  category,
  onClose,
}: {
  category: Task['category']
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const { addTask } = useStore()
  const categoryLabels = { morning: 'שגרת בוקר', anytime: 'במהלך היום', evening: 'שגרת ערב' }

  const handleAdd = () => {
    if (title.trim()) {
      addTask({ title: title.trim(), category, icon: '✅' })
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a',
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          width: '100%',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontFamily: 'Rubik, sans-serif', color: '#f5f5f5', fontSize: '18px', fontWeight: 700 }}>
            הוסף משימה — {categoryLabels[category]}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="שם המשימה..."
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1.5px solid #333',
            background: '#111',
            color: '#f5f5f5',
            fontSize: '16px',
            fontFamily: 'Rubik, sans-serif',
            direction: 'rtl',
            outline: 'none',
            marginBottom: '16px',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: '#f97316',
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'Rubik, sans-serif',
            cursor: 'pointer',
          }}
        >
          הוסף
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function TaskCategory({
  title,
  category,
  tasks,
}: {
  title: string
  category: Task['category']
  tasks: Task[]
}) {
  const [addingTo, setAddingTo] = useState<Task['category'] | null>(null)
  const categoryTasks = tasks.filter(t => t.category === category)
  const completedCount = categoryTasks.filter(t => t.isCompleted).length

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '14px',
      border: '1px solid #2a2a2a',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <button
          onClick={() => setAddingTo(category)}
          style={{
            background: 'none',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            color: '#6b7280',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={14} />
        </button>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#a3a3a3', fontFamily: 'Rubik, sans-serif', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {title}
          </span>
          {completedCount > 0 && completedCount === categoryTasks.length && (
            <span style={{ fontSize: '11px', color: '#22c55e', marginRight: '8px', fontWeight: 600 }}>✓ הושלם</span>
          )}
        </div>
      </div>

      <div>
        {categoryTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
        {categoryTasks.length === 0 && (
          <p style={{ color: '#3a3a3a', fontSize: '14px', textAlign: 'center', padding: '12px 0', fontFamily: 'Rubik, sans-serif' }}>
            לחץ + להוספת משימה
          </p>
        )}
      </div>

      <AnimatePresence>
        {addingTo === category && (
          <AddTaskModal category={category} onClose={() => setAddingTo(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function PanicModal({ onClose }: { onClose: () => void }) {
  const { usePanicButton } = useStore()
  const [phase, setPhase] = useState<'choose' | 'breathe' | 'exercise'>('choose')
  const [timer, setTimer] = useState(5)

  const handleUsed = () => {
    usePanicButton()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
      >
        <X size={24} />
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <div style={{ fontSize: '64px' }}>🛡️</div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f97316', margin: '0 0 12px', fontFamily: 'Rubik, sans-serif' }}>
            רגע של חולשה
          </h2>
          <p style={{ color: '#a3a3a3', fontSize: '16px', lineHeight: 1.6, fontFamily: 'Rubik, sans-serif', maxWidth: '300px' }}>
            זה בסדר. תנשום. אתה חזק יותר מהדחף הזה.
          </p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid #2a2a2a', padding: '20px', width: '100%', maxWidth: '320px' }}>
          <p style={{ color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif', textAlign: 'center', margin: 0, lineHeight: 1.7 }}>
            💡 <strong>עכשיו:</strong> עשה 20 שכיבות סמיכה — עד שהגוף ישכח מה רצה.
          </p>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid #2a2a2a', padding: '20px', width: '100%', maxWidth: '320px' }}>
          <p style={{ color: '#f5f5f5', fontSize: '15px', fontFamily: 'Rubik, sans-serif', textAlign: 'center', margin: 0, lineHeight: 1.7 }}>
            🌬️ <strong>נשימה:</strong> שאף 4 שניות, עצור 4, נשוף 8. חזור 3 פעמים.
          </p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleUsed}
        style={{
          width: '100%',
          padding: '18px',
          borderRadius: '14px',
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          fontSize: '17px',
          fontWeight: 700,
          fontFamily: 'Rubik, sans-serif',
          cursor: 'pointer',
        }}
      >
        עברתי את זה! +100 XP 💪
      </motion.button>
    </motion.div>
  )
}

export default function BaseTab() {
  const { tasks, level, xp, currentStreak } = useStore()
  const [panicOpen, setPanicOpen] = useState(false)

  const nextLevel = LEVEL_REQUIREMENTS[Math.min(level, 9)]
  const currentLevelReq = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>🔥 {currentStreak} ימים</div>
          <div style={{ fontSize: '12px', color: '#f97316', fontWeight: 600 }}>⚡ {xp} XP</div>
        </div>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Rubik, sans-serif' }}>
          הבסיס שלי
        </h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <FloatingIsland level={level} />
        <DailyProgress tasks={tasks} />

        {/* XP to next level */}
        {nextLevel && (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#a3a3a3', marginBottom: '8px', fontFamily: 'Rubik, sans-serif' }}>
              <span style={{ color: '#f97316' }}>{nextLevel.name} ←</span>
              <span>הרמה הבאה</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', fontFamily: 'Rubik, sans-serif' }}>
              <span>🔥 {nextLevel.streak} ימי Streak</span>
              <span>⚡ {nextLevel.xp.toLocaleString()} XP</span>
            </div>
          </div>
        )}

        {/* Tasks */}
        <TaskCategory title="שגרת בוקר" category="morning" tasks={tasks} />
        <TaskCategory title="במהלך היום" category="anytime" tasks={tasks} />
        <TaskCategory title="שגרת ערב" category="evening" tasks={tasks} />
      </div>

      {/* Panic Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setPanicOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          right: '16px',
          padding: '16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          border: 'none',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'Rubik, sans-serif',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(249,115,22,0.4)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <AlertTriangle size={18} />
        צריך עזרה? לחץ כאן
      </motion.button>

      <AnimatePresence>
        {panicOpen && <PanicModal onClose={() => setPanicOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
