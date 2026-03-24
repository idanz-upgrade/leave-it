'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useStore, OnboardingData } from '@/lib/store'

const STEPS = 6 // 4 questions + your why + language style

interface StepProps {
  onNext: (value: string | number) => void
  onBack: () => void
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ padding: '20px 24px 0' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '99px',
              background: i < step ? '#f97316' : '#2a2a2a',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px 20px',
        borderRadius: '12px',
        border: `1.5px solid ${selected ? '#f97316' : '#2a2a2a'}`,
        background: selected ? 'rgba(249,115,22,0.12)' : '#1a1a1a',
        color: selected ? '#f97316' : '#f5f5f5',
        textAlign: 'right',
        fontSize: '15px',
        fontFamily: 'Rubik, sans-serif',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>{label}</span>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: `2px solid ${selected ? '#f97316' : '#444'}`,
        background: selected ? '#f97316' : 'transparent',
        flexShrink: 0,
        transition: 'all 0.2s',
      }} />
    </motion.button>
  )
}

function Step1({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState('')
  const options = ['פחות מ-6 חודשים', 'חצי שנה עד שנה', '1-3 שנים', 'יותר מ-3 שנים']
  return (
    <StepWrapper title="כמה זמן ההרגל הזה נמשך?" onNext={() => onNext(selected)} onBack={onBack} canContinue={!!selected}>
      {options.map(o => (
        <RadioOption key={o} label={o} selected={selected === o} onClick={() => setSelected(o)} />
      ))}
    </StepWrapper>
  )
}

function Step2({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState('')
  const options = ['כל יום', 'כמה פעמים בשבוע', 'פעם בשבוע', 'לעיתים רחוקות']
  return (
    <StepWrapper title="באיזו תדירות זה קורה?" onNext={() => onNext(selected)} onBack={onBack} canContinue={!!selected}>
      {options.map(o => (
        <RadioOption key={o} label={o} selected={selected === o} onClick={() => setSelected(o)} />
      ))}
    </StepWrapper>
  )
}

function Step3({ onNext, onBack }: StepProps) {
  const [age, setAge] = useState(25)
  return (
    <StepWrapper title="בן כמה אתה?" onNext={() => onNext(age)} onBack={onBack} canContinue={true}>
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '72px', fontWeight: 800, color: '#f97316' }}>{age}</span>
        </div>
        <input
          type="range"
          min={14}
          max={70}
          value={age}
          onChange={e => setAge(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#f97316',
            height: '6px',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
          <span>14</span>
          <span>70</span>
        </div>
      </div>
    </StepWrapper>
  )
}

function Step4({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState('')
  const options = ['שיפור עצמי', 'סיבות דתיות', 'אחר']
  return (
    <StepWrapper title="מהי המטרה העיקרית שלך?" onNext={() => onNext(selected)} onBack={onBack} canContinue={!!selected}>
      {options.map(o => (
        <RadioOption key={o} label={o} selected={selected === o} onClick={() => setSelected(o)} />
      ))}
    </StepWrapper>
  )
}

function Step5({ onNext, onBack }: StepProps) {
  const [text, setText] = useState('')
  return (
    <StepWrapper title="ההתחייבות שלי" subtitle="למה אתה רוצה לשנות? משפט אחד שיחזיר אותך למסלול ברגעים קשים." onNext={() => onNext(text)} onBack={onBack} canContinue={text.trim().length > 3}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="למשל: אני עושה את זה כדי להיות אבא טוב יותר..."
        rows={4}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #2a2a2a',
          background: '#1a1a1a',
          color: '#f5f5f5',
          fontSize: '15px',
          fontFamily: 'Rubik, sans-serif',
          resize: 'none',
          outline: 'none',
          direction: 'rtl',
          lineHeight: 1.6,
        }}
        onFocus={e => { e.target.style.borderColor = '#f97316' }}
        onBlur={e => { e.target.style.borderColor = '#2a2a2a' }}
      />
    </StepWrapper>
  )
}

function Step6({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState<'secular' | 'religious'>('secular')
  return (
    <StepWrapper title="בחר סגנון שפה" subtitle="נתאים את האפליקציה לסגנון שמדבר אליך." onNext={() => onNext(selected)} onBack={onBack} canContinue={true}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelected('secular')}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '12px',
          border: `1.5px solid ${selected === 'secular' ? '#f97316' : '#2a2a2a'}`,
          background: selected === 'secular' ? 'rgba(249,115,22,0.12)' : '#1a1a1a',
          cursor: 'pointer',
          textAlign: 'right',
          marginBottom: '12px',
        }}
      >
        <div style={{ fontSize: '18px', marginBottom: '4px' }}>🧘 חילוני</div>
        <div style={{ color: '#a3a3a3', fontSize: '13px', fontFamily: 'Rubik, sans-serif' }}>שיפור עצמי, דופמין דיטוקס, משמעת עצמית</div>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelected('religious')}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '12px',
          border: `1.5px solid ${selected === 'religious' ? '#f97316' : '#2a2a2a'}`,
          background: selected === 'religious' ? 'rgba(249,115,22,0.12)' : '#1a1a1a',
          cursor: 'pointer',
          textAlign: 'right',
        }}
      >
        <div style={{ fontSize: '18px', marginBottom: '4px' }}>✡️ דתי / מסורתי</div>
        <div style={{ color: '#a3a3a3', fontSize: '13px', fontFamily: 'Rubik, sans-serif' }}>שמירת הברית, שמירת עיניים, קדושה</div>
      </motion.button>
    </StepWrapper>
  )
}

function StepWrapper({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  canContinue,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  canContinue: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#f5f5f5',
          margin: 0,
          lineHeight: 1.3,
          fontFamily: 'Rubik, sans-serif',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: '#a3a3a3', fontSize: '14px', marginTop: '8px', fontFamily: 'Rubik, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
      <motion.button
        whileTap={{ scale: canContinue ? 0.97 : 1 }}
        onClick={canContinue ? onNext : undefined}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          background: canContinue ? '#f97316' : '#2a2a2a',
          color: canContinue ? '#fff' : '#6b7280',
          border: 'none',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'Rubik, sans-serif',
          cursor: canContinue ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          marginTop: '8px',
        }}
      >
        המשך
      </motion.button>
    </div>
  )
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const { completeOnboarding } = useStore()

  const handleNext = (value: string | number) => {
    const keys = ['habitDuration', 'frequency', 'age', 'mainGoal', 'yourWhy', 'languageStyle']
    setAnswers(prev => ({ ...prev, [keys[step]]: value }))
    if (step < STEPS - 1) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      completeOnboarding({
        habitDuration: (answers.habitDuration || value) as string,
        frequency: (answers.frequency || value) as string,
        age: (answers.age || 25) as number,
        mainGoal: (answers.mainGoal || value) as string,
        yourWhy: (answers.yourWhy || value) as string,
        languageStyle: (answers.languageStyle || 'secular') as 'secular' | 'religious',
      })
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const steps = [Step1, Step2, Step3, Step4, Step5, Step6]
  const CurrentStep = steps[step]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px 8px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        {step > 0 && (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#a3a3a3',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: 'auto',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#f97316', fontFamily: 'Rubik, sans-serif' }}>
            שליטה
          </span>
        </div>
      </div>

      <ProgressBar step={step + 1} />

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <CurrentStep onNext={handleNext} onBack={handleBack} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Motivational footer */}
      <div style={{ padding: '16px 24px', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <p style={{ color: '#3a3a3a', fontSize: '12px', textAlign: 'center', fontFamily: 'Rubik, sans-serif' }}>
          שלב {step + 1} מתוך {STEPS}
        </p>
      </div>
    </div>
  )
}
