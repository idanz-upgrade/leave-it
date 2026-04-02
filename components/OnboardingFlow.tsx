import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Animated,
} from 'react-native'
import { router } from 'expo-router'
import { useStore, OnboardingData, Sport } from '@/lib/store'
import { C, F } from '@/lib/theme'

// ── Types ─────────────────────────────────────────────────────────────────────
type Answers = {
  symptoms: string[]
  habitDuration: string
  frequency: string
  triedBefore: string
  triggers: string[]
  dangerPlaces: string[]
  dangerTime: string
  costs: string[]
  goals: string[]
  primaryGoal: string
  motivationType: string
  sport: Sport | null
  name: string
  yourWhy: string
  selectedMorningTasks: string[]
  selectedAnytimeTasks: string[]
  selectedEveningTasks: string[]
  languageStyle: 'secular' | 'religious'
}

const INIT: Answers = {
  symptoms: [], habitDuration: '', frequency: '', triedBefore: '',
  triggers: [], dangerPlaces: [], dangerTime: '', costs: [], goals: [],
  primaryGoal: '', motivationType: '', sport: null, name: '', yourWhy: '',
  selectedMorningTasks: [], selectedAnytimeTasks: [], selectedEveningTasks: [],
  languageStyle: 'secular',
}

// Progress bar spans from Phase 2 questions through end of task selection
const Q_START = 2
const Q_END = 23
const Q_COUNT = Q_END - Q_START + 1

// ── Shared UI ─────────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  if (step < Q_START || step > Q_END) return null
  const pct = ((step - Q_START + 1) / Q_COUNT) * 100
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${pct}%` as any }]} />
    </View>
  )
}

function PillBtn({ label, onPress, disabled, outline }: { label: string; onPress: () => void; disabled?: boolean; outline?: boolean }) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.85}
      style={[s.pill, outline && s.pillOutline, disabled && s.pillDisabled]}
    >
      <Text style={[s.pillText, outline && s.pillOutlineText, disabled && s.pillDisabledText]}>{label}</Text>
    </TouchableOpacity>
  )
}

// Single-choice option row
function RadioRow({ label, sublabel, icon, selected, onPress }: {
  label: string; sublabel?: string; icon?: string; selected: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[s.optRow, selected && s.optRowSel]}>
      <View style={[s.circle, selected && s.circleSel]}>
        {selected && <View style={s.circleDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.optLabel, selected && s.optLabelSel]}>{label}</Text>
        {sublabel ? <Text style={s.optSub}>{sublabel}</Text> : null}
      </View>
      {icon ? <Text style={s.optIcon}>{icon}</Text> : null}
    </TouchableOpacity>
  )
}

// Multi-choice option row (checkbox)
function CheckRow({ label, sublabel, icon, selected, onPress }: {
  label: string; sublabel?: string; icon?: string; selected: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[s.optRow, selected && s.optRowSel]}>
      <View style={[s.checkbox, selected && s.checkboxSel]}>
        {selected && <Text style={s.checkmark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.optLabel, selected && s.optLabelSel]}>{label}</Text>
        {sublabel ? <Text style={s.optSub}>{sublabel}</Text> : null}
      </View>
      {icon ? <Text style={s.optIcon}>{icon}</Text> : null}
    </TouchableOpacity>
  )
}

// ── Hook Screen (no input, just big text + button) ────────────────────────────
function HookScreen({ title, subtitle, btn, onPress, green }: {
  title: string; subtitle?: string; btn: string; onPress: () => void; green?: string
}) {
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])
  return (
    <Animated.View style={[s.hookWrap, { opacity: fade }]}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>{title}</Text>
        {subtitle && !green && <Text style={s.hookSub}>{subtitle}</Text>}
        {green && (
          <Text style={s.hookGreen}>{green}</Text>
        )}
        {subtitle && green && <Text style={s.hookSub}>{subtitle}</Text>}
      </View>
      <PillBtn label={btn} onPress={onPress} />
    </Animated.View>
  )
}

// ── Q: Single choice ──────────────────────────────────────────────────────────
function SingleQ({ title, subtitle, opts, onNext }: {
  title: string; subtitle?: string
  opts: { label: string; sublabel?: string; icon?: string }[]
  onNext: (v: string) => void
}) {
  const [sel, setSel] = useState('')
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>{title}</Text>
        {subtitle && <Text style={s.qSub}>{subtitle}</Text>}
        <View style={s.optList}>
          {opts.map(o => (
            <RadioRow key={o.label} {...o} selected={sel === o.label} onPress={() => setSel(o.label)} />
          ))}
        </View>
      </View>
      <PillBtn label="המשך" onPress={() => onNext(sel)} disabled={!sel} />
    </View>
  )
}

// ── Q: Multi choice ──────────────────────────────────────────────────────────
function MultiQ({ title, subtitle, opts, min, onNext }: {
  title: string; subtitle?: string
  opts: { label: string; sublabel?: string; icon?: string }[]
  min?: number
  onNext: (v: string[]) => void
}) {
  const [sel, setSel] = useState<string[]>([])
  const toggle = (v: string) =>
    setSel(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])
  const ready = sel.length >= (min ?? 1)
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>{title}</Text>
        {subtitle && <Text style={s.qSub}>{subtitle}</Text>}
        <View style={s.optList}>
          {opts.map(o => (
            <CheckRow key={o.label} {...o} selected={sel.includes(o.label)} onPress={() => toggle(o.label)} />
          ))}
        </View>
      </View>
      <PillBtn label="המשך" onPress={() => onNext(sel)} disabled={!ready} />
    </View>
  )
}

// ── Q: Big two choices ────────────────────────────────────────────────────────
function BigTwoQ({ title, opts, onNext }: {
  title: string
  opts: { label: string; sublabel: string; emoji: string; value: string }[]
  onNext: (v: string) => void
}) {
  const [sel, setSel] = useState('')
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>{title}</Text>
        <View style={[s.optList, { gap: 12 }]}>
          {opts.map(o => (
            <TouchableOpacity key={o.value} onPress={() => setSel(o.value)} activeOpacity={0.8}
              style={[s.bigCard, sel === o.value && s.bigCardSel]}>
              <Text style={s.bigCardEmoji}>{o.emoji}</Text>
              <Text style={[s.bigCardLabel, sel === o.value && s.bigCardLabelSel]}>{o.label}</Text>
              <Text style={s.bigCardSub}>{o.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <PillBtn label="המשך" onPress={() => onNext(sel)} disabled={!sel} />
    </View>
  )
}

// ── Q: Sport selection (4-card grid) ─────────────────────────────────────────
function SportQ({ onNext }: { onNext: (v: Sport) => void }) {
  const [sel, setSel] = useState<Sport | null>(null)
  const SPORTS: { value: Sport; label: string; emoji: string }[] = [
    { value: 'football',   label: 'כדורגל',   emoji: '⚽' },
    { value: 'basketball', label: 'כדורסל',   emoji: '🏀' },
    { value: 'tennis',     label: 'טניס',     emoji: '🎾' },
    { value: 'running',    label: 'ריצה',      emoji: '🏃' },
  ]
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>איזה ספורט{'\n'}קרוב לליבך?</Text>
        <Text style={s.qSub}>הדמות שלך תיבנה בהתאם.</Text>
        <View style={s.sportGrid}>
          {SPORTS.map(sp => (
            <TouchableOpacity
              key={sp.value}
              onPress={() => setSel(sp.value)}
              activeOpacity={0.8}
              style={[s.sportCard, sel === sp.value && s.sportCardSel]}
            >
              <Text style={s.sportEmoji}>{sp.emoji}</Text>
              <Text style={[s.sportLabel, sel === sp.value && s.sportLabelSel]}>{sp.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <PillBtn label="המשך" onPress={() => sel && onNext(sel)} disabled={!sel} />
    </View>
  )
}

// ── Q: Language style ─────────────────────────────────────────────────────────
function LanguageStyleQ({ onNext }: { onNext: (v: 'secular' | 'religious') => void }) {
  const [sel, setSel] = useState<'secular' | 'religious' | null>(null)
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>מה הרקע{'\n'}שלך?</Text>
        <Text style={s.qSub}>זה יעזור לנו לדבר בשפה שלך.</Text>
        <View style={[s.optList, { gap: 12 }]}>
          {([
            { value: 'secular'  as const, label: 'חילוני / מסורתי קל', emoji: '💪', sub: 'שפה ישירה ועכשווית' },
            { value: 'religious' as const, label: 'דתי / מסורתי',       emoji: '✡️', sub: 'שמירת הברית, קדושה' },
          ] as const).map(o => (
            <TouchableOpacity
              key={o.value}
              onPress={() => setSel(o.value)}
              activeOpacity={0.8}
              style={[s.bigCard, sel === o.value && s.bigCardSel]}
            >
              <Text style={s.bigCardEmoji}>{o.emoji}</Text>
              <Text style={[s.bigCardLabel, sel === o.value && s.bigCardLabelSel]}>{o.label}</Text>
              <Text style={s.bigCardSub}>{o.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <PillBtn label="המשך" onPress={() => sel && onNext(sel)} disabled={!sel} />
    </View>
  )
}

// ── Q: Dynamic single (options come from previous answers) ────────────────────
function DynamicSingleQ({ title, subtitle, options, onNext }: {
  title: string; subtitle?: string; options: string[]; onNext: (v: string) => void
}) {
  const [sel, setSel] = useState('')
  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>{title}</Text>
        {subtitle && <Text style={s.qSub}>{subtitle}</Text>}
        <View style={s.optList}>
          {options.map(label => (
            <RadioRow key={label} label={label} selected={sel === label} onPress={() => setSel(label)} />
          ))}
        </View>
      </View>
      <PillBtn label="זה הדבר" onPress={() => onNext(sel)} disabled={!sel} />
    </View>
  )
}

// ── Name entry ────────────────────────────────────────────────────────────────
function NameEntry({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <View style={s.qWrap}>
      <Text style={s.hookTitle}>בואו נעשה{'\n'}את זה רשמי.</Text>
      <Text style={s.hookSub}>השם שלך חותם את המחויבות.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="הכנס שם"
        placeholderTextColor={C.dim}
        style={s.nameInput}
        textAlign="center"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => name.trim() && onNext(name.trim())}
      />
      <Text style={s.nameHint}>כתוב את שמך כדי להתחייב</Text>
      <PillBtn label="אני בפנים" onPress={() => onNext(name.trim())} disabled={name.trim().length < 2} />
    </View>
  )
}

// ── Your Why (skippable) ──────────────────────────────────────────────────────
function WhyEntry({ onNext }: { onNext: (v: string) => void }) {
  const [text, setText] = useState('')
  return (
    <View style={s.qWrap}>
      <Text style={s.hookTitle}>כשהדחף מגיע,{'\n'}מה תזכור?</Text>
      <Text style={s.hookSub}>כתוב משהו אישי. זה רק בשבילך.</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="אני עושה את זה כי..."
        placeholderTextColor={C.dim}
        multiline
        style={s.whyInput}
        textAlign="right"
        textAlignVertical="top"
      />
      <PillBtn label="המשך" onPress={() => onNext(text.trim())} />
      <TouchableOpacity onPress={() => onNext('')} style={s.skipBtn}>
        <Text style={s.skipText}>דלג</Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Edu: Dopamine graph ───────────────────────────────────────────────────────
function EduDopamine({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>הנה מה{'\n'}שקורה.</Text>
        <Text style={s.hookSub}>גירוי מהיר מזנק את הדופמין.{'\n'}ואז הבסיס שלך קורס.</Text>
        {/* Dopamine graph visual */}
        <View style={s.graphWrap}>
          <Text style={s.graphLabel}>בסיס</Text>
          <View style={s.graphLine}>
            <View style={s.graphSpike} />
            <View style={s.graphCrash} />
          </View>
          <Text style={s.graphCrashLabel}>הנפילה</Text>
        </View>
        <Text style={s.hookSub}>כלום אחר לא מרגיש מתגמל.</Text>
      </View>
      <PillBtn label="זה מסביר הרבה" onPress={onNext} />
    </View>
  )
}

// ── Edu: Brain heals (14/30/90) ───────────────────────────────────────────────
function EduHeal({ onNext }: { onNext: () => void }) {
  const milestones = [
    { days: '14', color: '#a78bfa', title: 'הדחפים נחלשים', sub: 'הסערה הראשונית עוברת' },
    { days: '30', color: '#fb923c', title: 'הבהירות חוזרת', sub: 'מיקוד ואנרגיה משתפרים' },
    { days: '90', color: '#4ade80', title: 'קו בסיס חדש', sub: 'המוח עוצב מחדש' },
  ]
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>המוח שלך{'\n'}יכול להחלים.</Text>
        <View style={s.healList}>
          {milestones.map((m, i) => (
            <View key={i} style={s.healRow}>
              <View style={[s.healDot, { backgroundColor: m.color }]} />
              <Text style={[s.healDays, { color: m.color }]}>{m.days} ימים</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.healTitle}>{m.title}</Text>
                <Text style={s.healSub}>{m.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <PillBtn label="אני רוצה את זה" onPress={onNext} />
    </View>
  )
}

// ── Edu: Stats (You're not alone) ─────────────────────────────────────────────
function EduStats({ onNext }: { onNext: () => void }) {
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>אתה לא{'\n'}לבד.</Text>
        <Text style={s.hookSub}>אלפי גברים בונים לצידך.</Text>
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>10+</Text>
            <Text style={s.statLabel}>רמות</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>100%</Text>
            <Text style={s.statLabel}>מבוסס מדע</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>24/7</Text>
            <Text style={s.statLabel}>תמיכה</Text>
          </View>
        </View>
      </View>
      <PillBtn label="אני מוכן" onPress={onNext} />
    </View>
  )
}

// ── Task selection screen ─────────────────────────────────────────────────────
function TaskSelect({ category, title, emoji, subtitle, tasks, min, max, recommended, onNext }: {
  category: string; title: string; emoji: string; subtitle: string
  tasks: string[]; min: number; max: number; recommended?: string[]
  onNext: (sel: string[]) => void
}) {
  const [sel, setSel] = useState<string[]>(() => {
    if (!recommended) return []
    return recommended.filter(r => tasks.includes(r)).slice(0, max)
  })
  const [customTasks, setCustomTasks] = useState<string[]>([])
  const [customInput, setCustomInput]  = useState('')

  const allTasks = [...tasks, ...customTasks]

  const toggle = (v: string) => {
    if (sel.includes(v)) { setSel(p => p.filter(x => x !== v)); return }
    if (sel.length < max) setSel(p => [...p, v])
  }

  const addCustom = () => {
    const t = customInput.trim()
    if (!t || allTasks.includes(t)) return
    setCustomTasks(p => [...p, t])
    if (sel.length < max) setSel(p => [...p, t])
    setCustomInput('')
  }

  const ready = sel.length >= min

  return (
    <View style={s.qWrap}>
      {/* Wrap header + list together — fixes space-between layout bug */}
      <View>
        <View style={s.taskHeader}>
          <Text style={s.taskEmoji}>{emoji}</Text>
          <Text style={s.taskTitle}>{title}</Text>
          <Text style={s.taskSub}>{subtitle}</Text>
          <View style={s.taskPick}>
            <Text style={s.taskPickText}>בחר {min}–{max}</Text>
          </View>
          <Text style={s.taskCount}>{sel.length} נבחרו</Text>
        </View>
        <View style={s.optList}>
          {allTasks.map(t => (
            <View key={t}>
              <CheckRow label={t} selected={sel.includes(t)} onPress={() => toggle(t)} />
              {recommended?.includes(t) && !sel.includes(t) && (
                <Text style={s.recBadge}>מומלץ עבורך ★</Text>
              )}
            </View>
          ))}
          {/* Custom task row */}
          <View style={s.customRow}>
            <TouchableOpacity onPress={addCustom} style={s.customAddBtn} activeOpacity={0.8}>
              <Text style={s.customAddText}>+</Text>
            </TouchableOpacity>
            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="הוסף משימה מותאמת..."
              placeholderTextColor="#3e3e52"
              style={s.customInput}
              textAlign="right"
              returnKeyType="done"
              onSubmitEditing={addCustom}
            />
          </View>
        </View>
      </View>
      <PillBtn label={category === 'evening' ? 'נעל משימות' : 'הבא'} onPress={() => onNext(sel)} disabled={!ready} />
    </View>
  )
}

// ── Plan Ready (summary) ──────────────────────────────────────────────────────
function PlanReady({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const rows = [
    { icon: '⚠️', label: 'שעת סיכון',    value: answers.dangerTime || 'ערב' },
    { icon: '📍', label: 'מקומות סיכון',  value: answers.dangerPlaces.slice(0, 2).join(', ') || 'לא צוין' },
    { icon: '⚡', label: 'טריגרים',       value: answers.triggers.slice(0, 2).join(', ') || 'לא צוין' },
    { icon: '🎯', label: 'מטרה ראשית',   value: answers.primaryGoal || answers.goals[0] || 'מיקוד' },
    { icon: '✅', label: 'משימות יומיות', value: `${(answers.selectedMorningTasks.length + answers.selectedAnytimeTasks.length + answers.selectedEveningTasks.length)} נבחרו` },
  ]
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>התוכנית שלך{'\n'}מוכנה.</Text>
        <View style={s.planCard}>
          {rows.map((r, i) => (
            <View key={i} style={[s.planRow, i < rows.length - 1 && s.planRowBorder]}>
              <Text style={s.planValue}>{r.value}</Text>
              <Text style={s.planLabel}>{r.label}  {r.icon}</Text>
            </View>
          ))}
        </View>
        <Text style={s.planBuilt}>נבנתה במיוחד עבורך.</Text>
      </View>
      <PillBtn label="התחל את המסע שלי" onPress={onNext} />
    </View>
  )
}

// ── Welcome end screen ────────────────────────────────────────────────────────
function WelcomeEnd({ name, languageStyle, onDone }: { name: string; languageStyle: 'secular' | 'religious'; onDone: () => void }) {
  const scale = useRef(new Animated.Value(0.85)).current
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()
  }, [])
  const isReligious = languageStyle === 'religious'
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Animated.Text style={[s.welcomeIcon, { transform: [{ scale }] }]}>{isReligious ? '✡️' : '⛺'}</Animated.Text>
        <Text style={s.hookTitle}>ברוך הבא,{'\n'}{name || 'גיבור'}.</Text>
        <Text style={s.hookGreen}>{isReligious ? 'הכח לשמור על הקדושה מחכה בך.' : 'הבסיס שלך מחכה.'}</Text>
        <Text style={s.hookSub}>יום 1</Text>
      </View>
      <PillBtn label={isReligious ? 'בואו נתחזק' : 'בואו נבנה'} onPress={onDone} />
    </View>
  )
}

// ── Main Flow ─────────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(INIT)
  const { completeOnboarding } = useStore()

  const upd = (patch: Partial<Answers>) => setAnswers(p => ({ ...p, ...patch }))
  const next = (patch?: Partial<Answers>) => {
    if (patch) upd(patch)
    setStep(s => s + 1)
  }
  const back = () => setStep(s => Math.max(0, s - 1))

  const finish = (finalAnswers: Answers) => {
    const data: OnboardingData = {
      name:                 finalAnswers.name,
      sport:                finalAnswers.sport,
      symptoms:             finalAnswers.symptoms,
      habitDuration:        finalAnswers.habitDuration,
      frequency:            finalAnswers.frequency,
      triedBefore:          finalAnswers.triedBefore,
      triggers:             finalAnswers.triggers,
      dangerPlaces:         finalAnswers.dangerPlaces,
      dangerTime:           finalAnswers.dangerTime,
      costs:                finalAnswers.costs,
      goals:                finalAnswers.goals,
      primaryGoal:          finalAnswers.primaryGoal,
      motivationType:       finalAnswers.motivationType,
      yourWhy:              finalAnswers.yourWhy,
      languageStyle:        finalAnswers.languageStyle,
      selectedMorningTasks:  finalAnswers.selectedMorningTasks,
      selectedAnytimeTasks:  finalAnswers.selectedAnytimeTasks,
      selectedEveningTasks:  finalAnswers.selectedEveningTasks,
    }
    completeOnboarding(data)
    router.replace('/paywall')
  }

  const renderStep = () => {
    switch (step) {
      // ── Phase 1: Hooks ──────────────────────────────────────────────────────
      case 0:
        return (
          <HookScreen
            title={'ניסית לעצור בעבר.\nעשית כמה ימים.\nאולי שבוע.\nואז משהו קרה.'}
            btn="כן..."
            onPress={() => next()}
          />
        )
      case 1:
        return (
          <HookScreen
            title={'תדמיין שיש לך\nשליטה מוחלטת.'}
            btn="אני רוצה את זה"
            onPress={() => next()}
          />
        )

      // ── Phase 2: Questions ──────────────────────────────────────────────────

      case 2:
        return (
          <MultiQ
            title="מה אתה מרגיש?"
            subtitle="בחר כל מה שמתאים."
            opts={[
              { label: 'מוטיבציה נמוכה',       icon: '📉' },
              { label: 'ערפל מוחי',             icon: '🌫️' },
              { label: 'קושי להתרכז',            icon: '🎯' },
              { label: 'ביטחון עצמי נמוך',       icon: '😔' },
              { label: 'בורח מהחיים האמיתיים',   icon: '🚪' },
              { label: 'פחות עניין בחברה',       icon: '👥' },
            ]}
            onNext={v => next({ symptoms: v })}
          />
        )
      case 3:
        return (
          <SingleQ
            title="כמה זמן זה נמשך?"
            opts={[
              { label: 'פחות מ-6 חודשים' },
              { label: 'חצי שנה עד שנה' },
              { label: '1–3 שנים' },
              { label: 'יותר מ-3 שנים' },
            ]}
            onNext={v => next({ habitDuration: v })}
          />
        )
      case 4:
        return (
          <SingleQ
            title="כמה פעמים זה קורה?"
            opts={[
              { label: 'כל יום' },
              { label: 'כמה פעמים בשבוע' },
              { label: 'פעם בשבוע' },
              { label: 'לעיתים רחוקות' },
            ]}
            onNext={v => next({ frequency: v })}
          />
        )
      case 5:
        return (
          <SingleQ
            title="ניסית לעצור בעבר?"
            opts={[
              { label: 'הרבה פעמים' },
              { label: 'כמה פעמים' },
              { label: 'פעם-פעמיים' },
              { label: 'מעולם לא ברצינות' },
            ]}
            onNext={v => next({ triedBefore: v })}
          />
        )
      case 6:
        return (
          <MultiQ
            title="מה בדרך כלל גורם לזה?"
            subtitle="בחר כל מה שמתאים."
            opts={[
              { label: 'לחץ',                  icon: '⚡' },
              { label: 'שעמום',                icon: '😑' },
              { label: 'מאוחר בלילה',          icon: '🌙' },
              { label: 'פשוט לא יכול להתאפק', icon: '🤯' },
            ]}
            onNext={v => next({ triggers: v })}
          />
        )
      case 7:
        return (
          <MultiQ
            title="איפה זה בדרך כלל קורה?"
            subtitle="בחר כל מה שמתאים."
            opts={[
              { label: 'חדר השינה',  icon: '🛏️' },
              { label: 'אמבטיה',    icon: '🚿' },
              { label: 'כשלבד',     icon: '🚶' },
              { label: 'ליד המחשב', icon: '💻' },
            ]}
            onNext={v => next({ dangerPlaces: v })}
          />
        )
      case 8:
        return (
          <SingleQ
            title="מתי הדחפים הכי חזקים?"
            opts={[
              { label: 'בוקר',        icon: '🌅' },
              { label: 'צהריים',      icon: '☀️' },
              { label: 'ערב',         icon: '🌆' },
              { label: 'לילה מאוחר', icon: '🌙' },
            ]}
            onNext={v => next({ dangerTime: v })}
          />
        )
      case 9:
        return (
          <MultiQ
            title="מה זה עולה לך?"
            subtitle="בחר כל מה שמתאים."
            opts={[
              { label: 'מערכת יחסים',      icon: '❤️' },
              { label: 'קריירה / לימודים', icon: '💼' },
              { label: 'כבוד עצמי',        icon: '🧠' },
              { label: 'בריאות',           icon: '🏃' },
              { label: 'זמן',              icon: '⏱️' },
            ]}
            onNext={v => next({ costs: v })}
          />
        )
      case 10:
        return (
          <MultiQ
            title="מה אתה רוצה בחזרה?"
            subtitle="בחר כל מה שמתאים."
            opts={[
              { label: 'מיקוד וחדות',    icon: '👁️' },
              { label: 'ביטחון עצמי',    icon: '⭐' },
              { label: 'מוטיבציה',       icon: '🔥' },
              { label: 'חיי חברה חזקים', icon: '👥' },
              { label: 'שליטה בדחפים',  icon: '✋' },
            ]}
            onNext={v => next({ goals: v })}
          />
        )
      case 11:
        return (
          <BigTwoQ
            title="מה מניע אותך יותר?"
            opts={[
              { label: 'להיות טוב יותר', sublabel: 'אני רוצה לממש את הפוטנציאל שלי', emoji: '⬆️', value: 'growth' },
              { label: 'לברוח מהכאב',   sublabel: 'אני רוצה להפסיק להרגיש כך',      emoji: '🔄', value: 'escape' },
            ]}
            onNext={v => next({ motivationType: v })}
          />
        )

      // ── Phase 2.5: Identity ─────────────────────────────────────────────────
      case 12:
        return <SportQ onNext={v => next({ sport: v })} />
      case 13:
        return <LanguageStyleQ onNext={v => next({ languageStyle: v })} />

      // ── Phase 3: Education ──────────────────────────────────────────────────
      case 14:
        return (
          <HookScreen
            title={'זו לא בעיה\nשל כוח רצון.'}
            subtitle="המוח שלך נחטף."
            btn="מה הכוונה?"
            onPress={() => next()}
          />
        )
      case 15:
        return <EduDopamine onNext={() => next()} />
      case 16:
        return (
          <HookScreen
            title={'כל פעם,\nהנפילה עמוקה יותר.'}
            subtitle={'החיים האמיתיים מרגישים משעממים.\nהמטרות נראות קשות יותר.\nאתה מרגיש תקוע.'}
            btn="איך אני מתקן את זה?"
            onPress={() => next()}
          />
        )
      case 17:
        return <EduHeal onNext={() => next()} />

      // ── Phase 4: Commitment ─────────────────────────────────────────────────
      case 18:
        return <NameEntry onNext={v => next({ name: v })} />
      case 19:
        return <WhyEntry onNext={v => next({ yourWhy: v })} />

      // ── Phase 5: Tasks ──────────────────────────────────────────────────────
      case 20:
        return (
          <HookScreen
            title={'המשימות\nהיומיות שלך.'}
            subtitle={'השלם אותם כל יום כדי לעלות רמה.'}
            btn="בחר משימות"
            onPress={() => next()}
          />
        )
      case 21: {
        const morningRec = [
          ...(answers.dangerTime === 'בוקר' ? ['אין טלפון 30 דקות ראשונות'] : []),
          ...(answers.triggers.includes('לחץ') ? ['מקלחת קרה', 'אימון בוקר'] : ['מקלחת קרה']),
        ]
        return (
          <TaskSelect
            category="morning"
            title="בוקר"
            emoji="🌅"
            subtitle="התחל את יומך בחוזקה לפני שהדחפים מגיעים."
            tasks={[
              'אין טלפון 30 דקות ראשונות',
              'מקלחת קרה',
              'אימון בוקר',
              'סידור המיטה',
              'הליכה בבוקר',
            ]}
            min={1} max={3}
            recommended={morningRec}
            onNext={v => next({ selectedMorningTasks: v })}
          />
        )
      }
      case 22: {
        const anytimeRec = [
          ...(answers.triggers.includes('שעמום') ? ['סשן עבודה ממוקדת', 'קריאת 20 עמודים'] : []),
          ...(answers.dangerPlaces.includes('ליד המחשב') ? ['ללא רשתות חברתיות (2 שעות)'] : []),
          ...(answers.goals.includes('מוטיבציה') ? ['אימון'] : []),
        ]
        return (
          <TaskSelect
            category="anytime"
            title="בכל עת"
            emoji="⚡"
            subtitle="מלא את יומך בניצחונות אמיתיים. ידיים עסוקות, מוח צלול."
            tasks={[
              'אימון',
              'קריאת 20 עמודים',
              'הליכה',
              'סשן עבודה ממוקדת',
              'ללא רשתות חברתיות (2 שעות)',
            ]}
            min={2} max={4}
            recommended={anytimeRec}
            onNext={v => next({ selectedAnytimeTasks: v })}
          />
        )
      }
      case 23: {
        const eveningRec = [
          ...(answers.dangerTime === 'לילה מאוחר' || answers.triggers.includes('מאוחר בלילה') || answers.dangerTime === 'ערב'
            ? ['טלפון הצידה ב-22:00'] : []),
          ...(answers.dangerTime === 'לילה מאוחר' ? ['קריאה לפני שינה'] : []),
        ]
        return (
          <TaskSelect
            category="evening"
            title="ערב"
            emoji="🌙"
            subtitle="זו שעת סיכון. הגן על עצמך."
            tasks={[
              'טלפון הצידה ב-22:00',
              'יומן',
              'קריאה לפני שינה',
              'מתיחות ערב / יוגה',
              'תכנון למחר',
            ]}
            min={1} max={3}
            recommended={eveningRec}
            onNext={v => finish({ ...answers, selectedEveningTasks: v })}
          />
        )
      }

      default:
        return null
    }
  }

  const showBack = step > 0
  const showProgress = step >= Q_START && step <= Q_END

  return (
    <SafeAreaView style={s.root}>
      <ProgressBar step={step} />
      {/* Back button */}
      {showBack && (
        <TouchableOpacity onPress={back} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>→</Text>
        </TouchableOpacity>
      )}
      {showProgress && (
        <Text style={s.stepCount}>שלב {step - Q_START + 1} מתוך {Q_COUNT}</Text>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 28, paddingBottom: 40, flexGrow: 1 },

  progressTrack: { height: 3, backgroundColor: C.border, marginTop: 2 },
  progressFill:  { height: 3, backgroundColor: C.orange, borderRadius: 99 },

  backBtn:   { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  backArrow: { fontSize: 22, color: C.muted },
  stepCount: { textAlign: 'center', color: C.dim, fontSize: 12, fontFamily: F.regular, marginTop: 4 },

  // Hook screens
  hookWrap:   { flex: 1, justifyContent: 'space-between', minHeight: 580 },
  hookCenter: { flex: 1, justifyContent: 'center', paddingTop: 40 },
  hookTitle:  { fontSize: 34, fontFamily: F.black, color: '#ffffff', textAlign: 'center', lineHeight: 42, marginBottom: 16 },
  hookSub:    { fontSize: 15, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', lineHeight: 23, marginTop: 4 },
  hookGreen:  { fontSize: 15, fontFamily: F.bold, color: '#4ade80', textAlign: 'center', marginTop: 10 },
  welcomeIcon: { fontSize: 72, textAlign: 'center', marginBottom: 20 },

  // Question screens
  qWrap:  { flex: 1, justifyContent: 'space-between', paddingTop: 24 },
  qTitle: { fontSize: 26, fontFamily: F.black, color: '#ffffff', textAlign: 'right', lineHeight: 34, marginBottom: 6 },
  qSub:   { fontSize: 13, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'right', marginBottom: 20, lineHeight: 20 },
  optList: { gap: 8, marginBottom: 28 },

  // Option rows
  optRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#1e1e2e', backgroundColor: '#12121f',
  },
  optRowSel:   { borderColor: C.orange, backgroundColor: C.orangeDim ?? '#1f150a' },
  optLabel:    { fontSize: 16, fontFamily: F.bold, color: '#e2e2e8', textAlign: 'right' },
  optLabelSel: { color: C.orange },
  optSub:      { fontSize: 12, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'right', marginTop: 2 },
  optIcon:     { fontSize: 22 },

  // Radio
  circle:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#3e3e52', alignItems: 'center', justifyContent: 'center' },
  circleSel: { borderColor: C.orange },
  circleDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: C.orange },

  // Checkbox
  checkbox:    { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#3e3e52', alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { borderColor: C.orange, backgroundColor: C.orange },
  checkmark:   { fontSize: 13, color: '#fff', fontFamily: F.bold },

  // Big two-choice cards
  bigCard: {
    padding: 22, borderRadius: 18, borderWidth: 1.5, borderColor: '#1e1e2e',
    backgroundColor: '#12121f', alignItems: 'center', gap: 6,
  },
  bigCardSel:      { borderColor: C.orange, backgroundColor: C.orangeDim ?? '#1f150a' },
  bigCardEmoji:    { fontSize: 32 },
  bigCardLabel:    { fontSize: 18, fontFamily: F.bold, color: '#e2e2e8', textAlign: 'center' },
  bigCardLabelSel: { color: C.orange },
  bigCardSub:      { fontSize: 13, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center' },

  // Pill button
  pill: {
    backgroundColor: '#ffffff', borderRadius: 100, paddingVertical: 18,
    paddingHorizontal: 32, alignItems: 'center', marginTop: 8,
  },
  pillOutline:      { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ffffff' },
  pillDisabled:     { backgroundColor: '#1e1e2e' },
  pillText:         { fontSize: 17, fontFamily: F.bold, color: '#0a0a0a' },
  pillOutlineText:  { color: '#ffffff' },
  pillDisabledText: { color: '#3e3e52' },

  // Name entry
  nameInput: {
    borderWidth: 1.5, borderColor: '#1e1e2e', borderRadius: 14, marginVertical: 20,
    padding: 18, color: '#ffffff', fontSize: 20, fontFamily: F.bold,
    backgroundColor: '#12121f', textAlign: 'center',
  },
  nameHint: { color: '#8b8b9e', fontSize: 12, fontFamily: F.regular, textAlign: 'center', marginBottom: 16 },

  // Why entry
  whyInput: {
    borderWidth: 1.5, borderColor: '#1e1e2e', borderRadius: 14,
    padding: 16, color: '#ffffff', fontSize: 16, fontFamily: F.regular,
    backgroundColor: '#12121f', minHeight: 120, marginVertical: 20,
  },
  skipBtn: { alignItems: 'center', marginTop: 14 },
  skipText: { color: '#8b8b9e', fontSize: 15, fontFamily: F.regular },

  // Dopamine graph (symbolic)
  graphWrap: { alignItems: 'center', marginVertical: 24 },
  graphLabel: { color: '#8b8b9e', fontSize: 12, fontFamily: F.regular, alignSelf: 'flex-end', marginBottom: 4 },
  graphLine:  { flexDirection: 'row', alignItems: 'flex-end', gap: 0 },
  graphSpike: { width: 3, height: 80, backgroundColor: '#a78bfa', borderRadius: 4, marginHorizontal: 2 },
  graphCrash: { width: 3, height: 30, backgroundColor: '#ef4444', borderRadius: 4, marginLeft: 8, alignSelf: 'flex-end', transform: [{ rotate: '20deg' }] },
  graphCrashLabel: { color: '#ef4444', fontSize: 11, fontFamily: F.regular, marginTop: 4 },

  // Heal timeline
  healList: { gap: 16, marginTop: 24, width: '100%' },
  healRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healDot:  { width: 12, height: 12, borderRadius: 6 },
  healDays: { fontSize: 16, fontFamily: F.bold, width: 70, textAlign: 'right' },
  healTitle: { fontSize: 15, fontFamily: F.bold, color: '#ffffff', textAlign: 'right' },
  healSub:   { fontSize: 12, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'right' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  statCard: {
    flex: 1, backgroundColor: '#12121f', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#1e1e2e',
  },
  statNum:   { fontSize: 20, fontFamily: F.black, color: '#ffffff' },
  statLabel: { fontSize: 11, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', marginTop: 4 },

  // Task selection
  taskHeader: { alignItems: 'center', marginBottom: 20 },
  taskEmoji:  { fontSize: 36, marginBottom: 8 },
  taskTitle:  { fontSize: 26, fontFamily: F.black, color: '#ffffff' },
  taskSub:    { fontSize: 13, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', marginTop: 4, lineHeight: 20 },
  taskPick:   { marginTop: 10, paddingHorizontal: 14, paddingVertical: 4, backgroundColor: '#12121f', borderRadius: 99 },
  taskPickText: { fontSize: 12, fontFamily: F.regular, color: C.orange },
  taskCount:  { fontSize: 11, color: '#8b8b9e', fontFamily: F.regular, marginTop: 6 },

  // Sport grid
  sportGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 28 },
  sportCard: {
    width: '47%', padding: 20, borderRadius: 16, borderWidth: 1.5,
    borderColor: '#1e1e2e', backgroundColor: '#12121f', alignItems: 'center', gap: 8,
  },
  sportCardSel:  { borderColor: C.orange, backgroundColor: C.orangeDim ?? '#1f150a' },
  sportEmoji:    { fontSize: 36 },
  sportLabel:    { fontSize: 16, fontFamily: F.bold, color: '#e2e2e8' },
  sportLabelSel: { color: C.orange },

  // Recommended badge
  recBadge: { fontSize: 10, color: C.orange, fontFamily: F.bold, textAlign: 'right', marginTop: -4, marginBottom: 4, paddingRight: 6 },

  // Plan ready
  planCard: {
    backgroundColor: '#12121f', borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1e1e2e', marginTop: 20, width: '100%',
  },
  planRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  planRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1e1e2e' },
  planLabel: { fontSize: 14, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'right' },
  planValue: { fontSize: 14, fontFamily: F.bold, color: '#ffffff' },
  planBuilt: { fontSize: 12, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', marginTop: 12 },

  // Custom task input
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  customInput: {
    flex: 1, backgroundColor: '#12121f', borderWidth: 1, borderColor: '#1e1e2e',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: '#ffffff', fontSize: 15, fontFamily: F.regular, textAlign: 'right',
  },
  customAddBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  customAddText: { fontSize: 24, color: '#fff', lineHeight: 28 },
})
