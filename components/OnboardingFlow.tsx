import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Animated,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useStore, OnboardingData } from '@/lib/store'
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
  hobby: string
  name: string
  nickname: string
  yourWhy: string
  selectedMorningTasks: string[]
  selectedAnytimeTasks: string[]
  selectedEveningTasks: string[]
  languageStyle: 'secular' | 'religious'
}

const INIT: Answers = {
  symptoms: [], habitDuration: '', frequency: '', triedBefore: '',
  triggers: [], dangerPlaces: [], dangerTime: '', costs: [], goals: [],
  primaryGoal: '', motivationType: '', hobby: '', name: '', nickname: '', yourWhy: '',
  selectedMorningTasks: [], selectedAnytimeTasks: [], selectedEveningTasks: [],
  languageStyle: 'secular',
}

// Progress bar spans from Phase 2 questions through end of task selection
const Q_START = 2
const Q_END = 22
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

// ── Hobby task helper ─────────────────────────────────────────────────────────
function hobbyTask(hobby: string, ctx: 'morning' | 'anytime' | 'evening'): string | null {
  if (!hobby) return null
  if (ctx === 'evening') return hobby === 'כלי נגינה' ? 'נגינה 20 דקות' : 'סקירת היום'
  const map: Record<string, string> = {
    'כדורגל':    ctx === 'morning' ? 'אימון כדורגל בוקר' : 'אימון כדורגל',
    'ריצה':     ctx === 'morning' ? 'ריצה בוקר' : 'ריצה',
    'כלי נגינה': 'נגינה 15 דקות',
    'כדורסל':   ctx === 'morning' ? 'אימון כדורסל בוקר' : 'אימון כדורסל',
    'טניס':    ctx === 'morning' ? 'אימון טניס בוקר' : 'אימון טניס',
  }
  return map[hobby] ?? hobby
}

// ── Q: Hobby selection ────────────────────────────────────────────────────────
function HobbyQ({ onNext }: { onNext: (v: string) => void }) {
  const [sel, setSel]             = useState('')
  const [customText, setCustomText] = useState('')
  const HOBBIES = [
    { value: 'כדורגל',    emoji: '⚽' },
    { value: 'כדורסל',   emoji: '🏀' },
    { value: 'טניס',      emoji: '🎾' },
    { value: 'ריצה',      emoji: '🏃' },
    { value: 'כלי נגינה', emoji: '🎸' },
  ]
  const isOther  = sel === 'other'
  const canNext  = sel && (sel !== 'other' || customText.trim().length > 0)
  const handleNext = () => onNext(isOther ? customText.trim() : sel)

  return (
    <View style={s.qWrap}>
      <View>
        <Text style={s.qTitle}>מה התחביב שלך?</Text>
        <View style={s.sportGrid}>
          {HOBBIES.map(h => (
            <TouchableOpacity
              key={h.value}
              onPress={() => { setSel(h.value); setCustomText('') }}
              activeOpacity={0.8}
              style={[s.sportCard, sel === h.value && s.sportCardSel]}
            >
              <Text style={s.sportEmoji}>{h.emoji}</Text>
              <Text style={[s.sportLabel, sel === h.value && s.sportLabelSel]}>{h.value}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setSel('other')}
            activeOpacity={0.8}
            style={[s.sportCard, isOther && s.sportCardSel]}
          >
            <Text style={s.sportEmoji}>➕</Text>
            <Text style={[s.sportLabel, isOther && s.sportLabelSel]}>אחר</Text>
          </TouchableOpacity>
        </View>
        {isOther && (
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            placeholder="הכנס תחביב..."
            placeholderTextColor={C.dim}
            style={[s.nameInput, { marginTop: 0, marginBottom: 0 }]}
            textAlign="right"
            autoFocus
            returnKeyType="done"
          />
        )}
      </View>
      <PillBtn label="המשך" onPress={handleNext} disabled={!canNext} />
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
function NameEntry({ onNext }: { onNext: (name: string, nickname: string) => void }) {
  const [name, setName]           = useState('')
  const [nickname, setNickname]   = useState('')
  const nicknameRef               = useRef<any>(null)

  return (
    <View style={s.qWrap}>
      <Text style={s.hookTitle}>בואו נעשה{'\n'}את זה רשמי.</Text>
      <Text style={s.hookSub}>השם שלך חותם את המחויבות.</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="מה שמך?"
        placeholderTextColor={C.dim}
        style={s.nameInput}
        textAlign="right"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => nicknameRef.current?.focus()}
      />
      <TextInput
        ref={nicknameRef}
        value={nickname}
        onChangeText={setNickname}
        placeholder="לוחם, אריה, מלך..."
        placeholderTextColor={C.dim}
        style={[s.nameInput, { marginTop: 12 }]}
        textAlign="right"
        returnKeyType="done"
        onSubmitEditing={() => name.trim().length >= 2 && onNext(name.trim(), nickname.trim())}
      />
      <Text style={s.nameHint}>שם פרטי + כינוי (לא חובה)</Text>
      <PillBtn label="אני בפנים" onPress={() => onNext(name.trim(), nickname.trim())} disabled={name.trim().length < 2} />
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
  // Heights: above baseline = 140px, below = 80px
  const ABOVE = 140
  const BELOW = 80

  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>הנה מה{'\n'}שקורה.</Text>

        <View style={{ width: '100%', marginVertical: 20 }}>
          {/* Above-baseline section */}
          <View style={{ height: ABOVE, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
            {/* לפני */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: 44, height: 50, backgroundColor: '#444', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
            </View>
            {/* במהלך – peak */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ color: C.orange, fontSize: 12, fontFamily: F.bold, marginBottom: 4 }}>שיא</Text>
              <View style={{ width: 44, height: 130, backgroundColor: C.orange, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
            </View>
            {/* אחרי – empty above */}
            <View style={{ flex: 1 }} />
          </View>

          {/* Dashed baseline */}
          <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 4 }}>
            {Array.from({ length: 22 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 2, backgroundColor: '#555', borderRadius: 1 }} />
            ))}
          </View>
          <Text style={{ color: '#888', fontSize: 10, fontFamily: F.regular, textAlign: 'right', marginTop: 2, marginBottom: 0 }}>
            נורמה
          </Text>

          {/* Below-baseline section */}
          <View style={{ height: BELOW, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around' }}>
            {/* לפני – nothing */}
            <View style={{ flex: 1 }} />
            {/* במהלך – nothing */}
            <View style={{ flex: 1 }} />
            {/* אחרי – red crash */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: 44, height: 60, backgroundColor: '#ef4444', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
              <Text style={{ color: '#ef4444', fontSize: 10, fontFamily: F.bold, textAlign: 'center', marginTop: 4 }}>
                {'מתחת\nלנורמה'}
              </Text>
            </View>
          </View>

          {/* X-axis labels */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 }}>
            <Text style={{ flex: 1, textAlign: 'center', color: '#8b8b9e', fontSize: 12, fontFamily: F.regular }}>לפני</Text>
            <Text style={{ flex: 1, textAlign: 'center', color: '#8b8b9e', fontSize: 12, fontFamily: F.regular }}>במהלך</Text>
            <Text style={{ flex: 1, textAlign: 'center', color: '#8b8b9e', fontSize: 12, fontFamily: F.regular }}>אחרי</Text>
          </View>
        </View>

        <Text style={s.hookSub}>{'זו הסיבה שאחרי אתה מרגיש\nריקנות, עייפות ודיכאון קל'}</Text>
      </View>
      <PillBtn label="זה מסביר הרבה" onPress={onNext} />
    </View>
  )
}

// ── Edu: Brain heals – calendar grid ─────────────────────────────────────────
function EduHeal({ onNext }: { onNext: () => void }) {
  const MILESTONES = [
    { at: 14, color: '#4ade80', label: 'הדחפים מתחילים להיחלש' },
    { at: 30, color: '#60a5fa', label: 'אנרגיה וריכוז חוזרים' },
    { at: 90, color: '#fbbf24', label: 'המוח שלך השתנה' },
  ]
  const getColor = (day: number) => {
    if (day <= 14) return '#4ade80'
    if (day <= 30) return '#60a5fa'
    return '#fbbf24'
  }
  // 13 rows × 7 cols = 91 cells; days 1-90 colored, cell 91 empty
  const rows = Array.from({ length: 13 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => r * 7 + c + 1)
  )

  return (
    <View style={s.hookWrap}>
      <View style={[s.hookCenter, { paddingTop: 20 }]}>
        <Text style={s.hookTitle}>המוח שלך{'\n'}יכול להחלים.</Text>

        {/* Calendar grid */}
        <View style={{ width: '100%', marginVertical: 16 }}>
          {rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 3, marginBottom: 3 }}>
              {row.map(day => {
                const color = getColor(day)
                const isMark = day === 14 || day === 30 || day === 90
                return (
                  <View
                    key={day}
                    style={{
                      flex: 1, aspectRatio: 1, borderRadius: 4,
                      backgroundColor: day <= 90 ? color + '28' : 'transparent',
                      borderWidth: day <= 90 ? 1.5 : 0,
                      borderColor: day <= 90 ? (isMark ? color : color + '55') : 'transparent',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isMark && (
                      <Text style={{ fontSize: 7, color, fontFamily: F.bold }}>{day}</Text>
                    )}
                  </View>
                )
              })}
            </View>
          ))}
        </View>

        {/* Milestone tooltips */}
        <View style={{ gap: 8, width: '100%' }}>
          {MILESTONES.map(m => (
            <View key={m.at} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.color }} />
              <Text style={{ color: m.color, fontSize: 13, fontFamily: F.bold }}>{m.at} יום</Text>
              <Text style={{ color: '#8b8b9e', fontSize: 12, fontFamily: F.regular, flex: 1, textAlign: 'right' }}>— {m.label}</Text>
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

  // Flat layout (no space-between) — prevents PillBtn from overlapping checkboxes
  return (
    <View style={{ paddingTop: 24 }}>
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

// ── Task Editor (edit mode for TaskConfirm) ───────────────────────────────────
type EditableTask = { text: string; category: 'morning' | 'anytime' | 'evening' }
const CAT_META = [
  { cat: 'morning' as const, emoji: '🌅', label: 'בוקר' },
  { cat: 'anytime' as const, emoji: '⚡', label: 'יום' },
  { cat: 'evening' as const, emoji: '🌙', label: 'ערב' },
]

function TaskEditor({ initialMorning, initialAnytime, initialEvening, onDone }: {
  initialMorning: string[]; initialAnytime: string[]; initialEvening: string[];
  onDone: (m: string[], a: string[], e: string[]) => void
}) {
  const [tasks, setTasks] = useState<EditableTask[]>(() => [
    ...initialMorning.map(t => ({ text: t, category: 'morning' as const })),
    ...initialAnytime.map(t => ({ text: t, category: 'anytime' as const })),
    ...initialEvening.map(t => ({ text: t, category: 'evening' as const })),
  ])

  const moveTo = (text: string, cat: EditableTask['category']) =>
    setTasks(p => p.map(t => t.text === text ? { ...t, category: cat } : t))

  const remove = (text: string) =>
    setTasks(p => p.filter(t => t.text !== text))

  const handleDone = () => onDone(
    tasks.filter(t => t.category === 'morning').map(t => t.text),
    tasks.filter(t => t.category === 'anytime').map(t => t.text),
    tasks.filter(t => t.category === 'evening').map(t => t.text),
  )

  return (
    <View style={{ paddingTop: 16 }}>
      <Text style={[s.hookTitle, { fontSize: 26, marginBottom: 6 }]}>ערוך את התוכנית</Text>
      <Text style={[s.hookSub, { textAlign: 'right', marginBottom: 20 }]}>
        הזז משימות בין קטגוריות או מחק כדי להקל
      </Text>

      {CAT_META.map(sec => {
        const sectionTasks = tasks.filter(t => t.category === sec.cat)
        return (
          <View key={sec.cat} style={s.editSection}>
            <Text style={s.editSectionTitle}>{sec.emoji}  {sec.label}</Text>
            {sectionTasks.length === 0
              ? <Text style={s.editEmpty}>אין משימות</Text>
              : sectionTasks.map(task => (
                <View key={task.text} style={s.editTaskRow}>
                  {/* Category move buttons + delete */}
                  <View style={s.editCatBtns}>
                    {CAT_META.map(cm => (
                      <TouchableOpacity
                        key={cm.cat}
                        onPress={() => moveTo(task.text, cm.cat)}
                        style={[s.editCatBtn, task.category === cm.cat && s.editCatBtnActive]}
                        activeOpacity={0.75}
                      >
                        <Text style={s.editCatBtnEmoji}>{cm.emoji}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => remove(task.text)} style={s.editDeleteBtn} activeOpacity={0.75}>
                      <Text style={s.editDeleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.editTaskText}>{task.text}</Text>
                </View>
              ))
            }
          </View>
        )
      })}

      <View style={{ marginTop: 20 }}>
        <PillBtn label="אני מרוצה מהתוכנית 💪" onPress={handleDone} />
      </View>
    </View>
  )
}

// ── Task Confirmation ─────────────────────────────────────────────────────────
function TaskConfirm({ morning, anytime, evening, onConfirm, onUpdateAndConfirm }: {
  morning: string[]; anytime: string[]; evening: string[];
  onConfirm: () => void;
  onUpdateAndConfirm: (m: string[], a: string[], e: string[]) => void;
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <TaskEditor
        initialMorning={morning}
        initialAnytime={anytime}
        initialEvening={evening}
        onDone={(m, a, e) => onUpdateAndConfirm(m, a, e)}
      />
    )
  }

  const sections = [
    { emoji: '🌅', label: 'בוקר', tasks: morning },
    { emoji: '⚡', label: 'יום',  tasks: anytime },
    { emoji: '🌙', label: 'ערב',  tasks: evening },
  ]
  return (
    <View style={s.hookWrap}>
      <View style={s.hookCenter}>
        <Text style={s.hookTitle}>{'האם תוכל\nלעמוד בזה?'}</Text>
        <Text style={s.hookSub}>בוא נהיה כנים — האם זה ריאלי עבורך?</Text>
        <View style={s.confirmCard}>
          {sections.map(sec => sec.tasks.length > 0 && (
            <View key={sec.label} style={s.confirmSection}>
              <Text style={s.confirmSectionTitle}>{sec.emoji}  {sec.label}</Text>
              {sec.tasks.map(t => (
                <Text key={t} style={s.confirmTask}>• {t}</Text>
              ))}
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <PillBtn label="כן, אני מתחייב לזה 💪" onPress={onConfirm} />
        <TouchableOpacity onPress={() => setEditing(true)} style={s.easeBtn} activeOpacity={0.8}>
          <Text style={s.easeBtnText}>זה יותר מדי, תקל עלי</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <View style={[s.hookWrap, { alignItems: 'center' }]}>
      <View style={s.hookCenter}>
        <ActivityIndicator size="large" color={C.orange} />
        <Text style={[s.hookTitle, { marginTop: 28 }]}>{'בונה את התוכנית\nהאישית שלך...'}</Text>
        <Text style={s.hookSub}>מנתח את התשובות שלך</Text>
      </View>
    </View>
  )
}

// ── 90-Day Plan Screen ────────────────────────────────────────────────────────
function PlanScreen({ answers, onDone }: { answers: Answers; onDone: () => void }) {
  const isPleasure = answers.motivationType === 'pleasure'
  const name       = answers.nickname || answers.name || 'לוחם'
  const goalsText  = answers.goals.slice(0, 2).join(' + ') || 'מה שחשוב לך'
  const costsText  = answers.costs.slice(0, 2).join(' + ') || 'מה שהפסדת'

  const phases = isPleasure
    ? [
        { range: '0–14',  label: 'הדחפים מתחילים להיחלש',      color: '#4ade80' },
        { range: '14–30', label: `${goalsText} חוזרים אליך`,    color: '#60a5fa' },
        { range: '30–90', label: 'אתה הופך לאדם שרצית להיות',   color: '#fbbf24' },
      ]
    : [
        { range: '0–14',  label: 'הכאב מתחיל להיחלש',          color: '#4ade80' },
        { range: '14–30', label: `${costsText} מתחיל להשתפר`,  color: '#60a5fa' },
        { range: '30–90', label: 'החיים שאיבדת — חוזרים',       color: '#fbbf24' },
      ]

  const highlights = (isPleasure ? answers.goals : answers.costs).slice(0, 3)

  return (
    <View style={s.hookWrap}>
      <View style={[s.hookCenter, { paddingTop: 16 }]}>
        <Text style={s.hookTitle}>{`התוכנית שלך\nמוכנה, ${name}`}</Text>

        {/* Timeline */}
        <View style={{ width: '100%', marginTop: 20 }}>
          {phases.map((ph, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
              <View style={{ alignItems: 'center', marginLeft: 14 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ph.color, marginTop: 3 }} />
                {i < phases.length - 1 && (
                  <View style={{ width: 2, height: 28, backgroundColor: ph.color + '44', marginTop: 4 }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: ph.color, fontSize: 11, fontFamily: F.bold, textAlign: 'right' }}>{ph.range} ימים</Text>
                <Text style={{ color: '#fff', fontSize: 15, fontFamily: F.bold, lineHeight: 22, textAlign: 'right' }}>{ph.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Highlights */}
        {highlights.length > 0 && (
          <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
            {highlights.map(h => (
              <View key={h} style={s.highlightCard}>
                <Text style={s.highlightText}>{h}</Text>
                <Text style={s.highlightCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <PillBtn label="אני רוצה את זה ←" onPress={onDone} />
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
      nickname:             finalAnswers.nickname,
      sport:                null,
      hobby:                finalAnswers.hobby,
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
      languageStyle:        'secular',
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
              { label: 'מערכת יחסים',                              icon: '❤️' },
              { label: 'קריירה / לימודים',                         icon: '💼' },
              { label: 'כבוד עצמי',                                icon: '🧠' },
              { label: 'בריאות',                                   icon: '🏃' },
              { label: 'זמן',                                      icon: '⏱️' },
              { label: 'תחושת בושה וחרטה',                         icon: '😞' },
              { label: 'אתה לא מרוצה מאיך שאתה נראה על עצמך',     icon: '🪞' },
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
              { label: 'להיות טוב יותר', sublabel: 'אני רוצה לממש את הפוטנציאל שלי', emoji: '⬆️', value: 'pleasure' },
              { label: 'לברוח מהכאב',   sublabel: 'אני רוצה להפסיק להרגיש כך',      emoji: '🔄', value: 'pain' },
            ]}
            onNext={v => next({ motivationType: v })}
          />
        )

      // ── Phase 2.5: Identity ─────────────────────────────────────────────────
      case 12:
        return <HobbyQ onNext={v => next({ hobby: v })} />

      // ── Phase 3: Education ──────────────────────────────────────────────────
      case 13:
        return (
          <HookScreen
            title={'זה לא עניין של\nכוח רצון —\nזה מדע מדויק'}
            subtitle="המוח שלך נחטף."
            btn="אני רוצה להבין"
            onPress={() => next()}
          />
        )
      case 14:
        return <EduDopamine onNext={() => next()} />
      case 15:
        return (
          <HookScreen
            title={'כל פעם,\nהנפילה עמוקה יותר.'}
            subtitle={'החיים האמיתיים מרגישים משעממים.\nהמטרות נראות קשות יותר.\nאתה מרגיש תקוע.'}
            btn="איך אני מתקן את זה?"
            onPress={() => next()}
          />
        )
      case 16:
        return <EduHeal onNext={() => next()} />

      // ── Phase 4: Commitment ─────────────────────────────────────────────────
      case 17:
        return <NameEntry onNext={(name, nickname) => next({ name, nickname })} />
      case 18:
        return <WhyEntry onNext={v => next({ yourWhy: v })} />

      // ── Phase 5: Tasks ──────────────────────────────────────────────────────
      case 19:
        return (
          <HookScreen
            title={'המשימות\nהיומיות שלך.'}
            subtitle={'השלם אותם כל יום כדי לעלות רמה.'}
            btn="בחר משימות"
            onPress={() => next()}
          />
        )
      case 20: {
        const mHobby   = hobbyTask(answers.hobby, 'morning')
        const morningRec = [
          ...(answers.dangerTime === 'בוקר' ? ['אין טלפון 30 דקות ראשונות'] : []),
          'מקלחת קרה',
          ...(mHobby ? [mHobby] : []),
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
              'סידור המיטה',
              'הליכה בבוקר',
              ...(mHobby ? [mHobby] : []),
            ]}
            min={1} max={3}
            recommended={morningRec}
            onNext={v => next({ selectedMorningTasks: v })}
          />
        )
      }
      case 21: {
        const aHobby   = hobbyTask(answers.hobby, 'anytime')
        const anytimeRec = [
          ...(answers.triggers.includes('שעמום') ? ['סשן עבודה ממוקדת', 'קריאת 20 עמודים'] : []),
          ...(answers.dangerPlaces.includes('ליד המחשב') ? ['ללא רשתות חברתיות (2 שעות)'] : []),
          ...(aHobby ? [aHobby] : []),
        ]
        return (
          <TaskSelect
            category="anytime"
            title="במהלך היום"
            emoji="⚡"
            subtitle="מלא את יומך בניצחונות אמיתיים. ידיים עסוקות, מוח צלול."
            tasks={[
              'קריאת 20 עמודים',
              'סשן עבודה ממוקדת',
              'ללא רשתות חברתיות (2 שעות)',
              'הליכה',
              ...(aHobby ? [aHobby] : []),
            ]}
            min={1} max={2}
            recommended={anytimeRec}
            onNext={v => next({ selectedAnytimeTasks: v })}
          />
        )
      }
      case 22: {
        const eHobby   = hobbyTask(answers.hobby, 'evening')
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
              'מתיחות / יוגה',
              'תכנון למחר',
              ...(eHobby ? [eHobby] : []),
            ]}
            min={1} max={3}
            recommended={eveningRec}
            onNext={v => next({ selectedEveningTasks: v })}
          />
        )
      }
      case 23:
        return (
          <TaskConfirm
            morning={answers.selectedMorningTasks}
            anytime={answers.selectedAnytimeTasks}
            evening={answers.selectedEveningTasks}
            onConfirm={() => next()}
            onUpdateAndConfirm={(m, a, e) => next({
              selectedMorningTasks: m,
              selectedAnytimeTasks: a,
              selectedEveningTasks: e,
            })}
          />
        )
      case 24:
        return <LoadingScreen onDone={() => next()} />
      case 25:
        return <PlanScreen answers={answers} onDone={() => finish(answers)} />

      default:
        return null
    }
  }

  const showBack = step > 0 && step !== 24
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

  // Task confirmation
  confirmCard: {
    backgroundColor: '#12121f', borderRadius: 16, borderWidth: 1, borderColor: '#1e1e2e',
    padding: 16, width: '100%', marginTop: 20, gap: 14,
  },
  confirmSection: { gap: 6 },
  confirmSectionTitle: { fontSize: 13, fontFamily: F.bold, color: C.orange, textAlign: 'right' },
  confirmTask: { fontSize: 14, fontFamily: F.regular, color: '#e2e2e8', textAlign: 'right', paddingRight: 8 },

  // Ease button
  easeBtn: { alignItems: 'center', paddingVertical: 14 },
  easeBtnText: { fontSize: 14, fontFamily: F.regular, color: '#8b8b9e', textDecorationLine: 'underline' },

  // Task editor
  editSection: {
    marginBottom: 18,
    backgroundColor: '#12121f', borderRadius: 14,
    borderWidth: 1, borderColor: '#1e1e2e', padding: 14,
  },
  editSectionTitle: { fontSize: 12, fontFamily: F.bold, color: C.orange, textAlign: 'right', marginBottom: 10, letterSpacing: 1 },
  editEmpty: { fontSize: 13, color: '#444', fontFamily: F.regular, textAlign: 'right' },
  editTaskRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
  },
  editTaskText: { fontSize: 14, fontFamily: F.regular, color: '#e2e2e8', flex: 1, textAlign: 'right', marginRight: 10 },
  editCatBtns: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  editCatBtn: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#2a2a2a',
    backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
  },
  editCatBtnActive: { borderColor: C.orange, backgroundColor: C.orange + '22' },
  editCatBtnEmoji: { fontSize: 15 },
  editDeleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#3a1a1a',
    backgroundColor: '#1a0a0a', alignItems: 'center', justifyContent: 'center',
  },
  editDeleteText: { fontSize: 13, color: '#ef4444', fontFamily: F.bold },

  // Plan highlights
  highlightCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#12121f', borderRadius: 12, borderWidth: 1, borderColor: '#1e1e2e',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  highlightText:  { fontSize: 14, fontFamily: F.regular, color: '#e2e2e8', flex: 1, textAlign: 'right' },
  highlightCheck: { fontSize: 18, color: '#4ade80', marginLeft: 10 },

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
