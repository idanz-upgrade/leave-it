import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, SafeAreaView, Animated,
} from 'react-native'
import { useStore, TriggerEntry, Setback } from '@/lib/store'
import { C, F } from '@/lib/theme'

// ── Weekly Progress ──────────────────────────────────────────────────────────
const DAY_LABELS_RTL = ['ש׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳']
const BAR_MAX_H = 72

type DayStatus = 'clean' | 'failed' | 'unknown'

function getThisWeek(): { dateStr: string; label: string; isToday: boolean; isFuture: boolean }[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const offset = now.getDay() // 0=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - offset + i)
    const dateStr = d.toISOString().split('T')[0]
    return {
      dateStr,
      label: DAY_LABELS_RTL[6 - i], // reversed for RTL render
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    }
  }).reverse() // display RTL: Saturday left → Sunday right
}

function dayStatus(
  dateStr: string,
  journal: TriggerEntry[],
  setbacks: Setback[],
): DayStatus {
  const entry = journal.find(e => e.date === dateStr)
  if (entry) return (!entry.hadUrge || entry.resisted === true) ? 'clean' : 'failed'
  if (setbacks.some(sb => sb.createdAt.startsWith(dateStr))) return 'failed'
  return 'unknown'
}

function WeeklyProgress({
  journal, setbacks,
}: { journal: TriggerEntry[]; setbacks: Setback[] }) {
  const week = getThisWeek()
  const statuses = week.map(d => ({
    ...d,
    status: d.isFuture ? 'unknown' as DayStatus : dayStatus(d.dateStr, journal, setbacks),
  }))

  // Stats
  const pastDays    = statuses.filter(d => !d.isFuture)
  const cleanCount  = pastDays.filter(d => d.status === 'clean').length
  const hasAnyData  = pastDays.some(d => d.status !== 'unknown')

  const weekJournal = journal.filter(e => week.some(d => d.dateStr === e.date))
  const resistedCount = weekJournal.filter(e => e.hadUrge && e.resisted).length

  // Most common trigger
  const triggerMap: Record<string, number> = {}
  weekJournal.forEach(e => { if (e.trigger) triggerMap[e.trigger] = (triggerMap[e.trigger] ?? 0) + 1 })
  const topTrigger = Object.entries(triggerMap).sort((a, b) => b[1] - a[1])[0]?.[0]

  const barColor = (st: DayStatus) =>
    st === 'clean' ? C.green : st === 'failed' ? C.red : '#2a2a2a'
  const barRatio = (st: DayStatus) =>
    st === 'clean' ? 1 : st === 'failed' ? 0.3 : 0.1

  return (
    <View style={sw.wrap}>
      <Text style={sw.sectionTitle}>השבוע שלך</Text>

      {/* Bar chart */}
      <View style={sw.chartCard}>
        <View style={sw.barsRow}>
          {statuses.map(d => (
            <View key={d.dateStr} style={sw.barCol}>
              <View style={sw.barTrack}>
                <View style={[
                  sw.barFill,
                  {
                    height: BAR_MAX_H * barRatio(d.status),
                    backgroundColor: barColor(d.status),
                  },
                ]} />
              </View>
              <Text style={[sw.barLabel, d.isToday && { color: C.orange }]}>
                {d.label}
              </Text>
              {d.isToday && <View style={sw.todayDot} />}
            </View>
          ))}
        </View>
      </View>

      {/* Stats card */}
      <View style={sw.statsCard}>
        {!hasAnyData ? (
          <Text style={sw.emptyText}>סיים את היום הראשון שלך כדי לראות סטטיסטיקות</Text>
        ) : (
          <>
            <View style={sw.statRow}>
              <Text style={sw.statValue}>{cleanCount}/7</Text>
              <Text style={sw.statLabel}>ימים נקיים השבוע</Text>
            </View>
            <View style={sw.divider} />
            <View style={sw.statRow}>
              <Text style={[sw.statValue, { color: C.green }]}>{resistedCount}</Text>
              <Text style={sw.statLabel}>דחפים שעמדת בהם</Text>
            </View>
            {topTrigger && (
              <>
                <View style={sw.divider} />
                <View style={sw.statRow}>
                  <Text style={[sw.statValue, { color: C.orange, fontSize: 15 }]}>{topTrigger}</Text>
                  <Text style={sw.statLabel}>הטריגר הנפוץ ביותר</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </View>
  )
}

const sw = StyleSheet.create({
  wrap:        { gap: 10 },
  sectionTitle:{ fontSize: 11, fontFamily: F.black, color: C.dim, letterSpacing: 2.5, textAlign: 'right' },

  chartCard: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  barsRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol:   { alignItems: 'center', gap: 6, flex: 1 },
  barTrack: {
    height: BAR_MAX_H, width: '60%', justifyContent: 'flex-end',
    backgroundColor: '#141414', borderRadius: 6, overflow: 'hidden',
  },
  barFill:   { width: '100%', borderRadius: 6 },
  barLabel:  { fontSize: 9, fontFamily: F.bold, color: C.dim, letterSpacing: 0.3 },
  todayDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: C.orange },

  statsCard: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16, gap: 0,
  },
  statRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  statValue: { fontSize: 18, fontFamily: F.black, color: C.text },
  statLabel: { fontSize: 13, fontFamily: F.regular, color: C.muted, textAlign: 'right' },
  divider:   { height: 1, backgroundColor: '#1e1e1e' },
  emptyText: { fontSize: 13, color: C.dim, fontFamily: F.regular, textAlign: 'center', paddingVertical: 8 },
})

const MOODS = ['😔', '😕', '😐', '🙂', '😄']
const TRIGGERS = ['שעמום', 'לחץ', 'עייפות', 'בדידות', 'כעס', 'שעות לילה', 'אחר']

function StreakDisplay({ streak, longestStreak }: { streak: number; longestStreak: number }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start()
    }
  }, [streak])

  return (
    <View style={s.streakCard}>
      <View style={[s.streakGlow, { opacity: streak > 0 ? 1 : 0 }]} />
      <Animated.Text style={[{ fontSize: 56, marginBottom: 8 }, { transform: [{ scale }] }]}>
        {streak > 0 ? '🔥' : '💧'}
      </Animated.Text>
      <Text style={[s.streakNumber, { color: streak > 0 ? C.orange : C.dim }]}>{streak}</Text>
      <Text style={s.streakLabel}>{streak === 1 ? 'יום נקי' : 'ימים נקיים'}</Text>
      {longestStreak > 0 && <Text style={s.streakRecord}>שיא אישי: {longestStreak} ימים</Text>}
    </View>
  )
}

function MetricCard({ icon, value, label, sub }: { icon: string; value: number; label: string; sub?: string }) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricIcon}>{icon}</Text>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
      {sub && <Text style={s.metricSub}>{sub}</Text>}
    </View>
  )
}

function CheckinModal({ onClose }: { onClose: () => void }) {
  const { addCheckin } = useStore()
  const [mood, setMood] = useState(3)
  const [temptation, setTemptation] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const toggleTrigger = (t: string) =>
    setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  const handleSubmit = () => {
    addCheckin({ mood, temptationLevel: temptation, triggers: selected, notes })
    onClose()
  }

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.sheetHeader}>
              <TouchableOpacity onPress={onClose}><Text style={{ color: C.dim, fontSize: 20 }}>✕</Text></TouchableOpacity>
              <Text style={s.sheetTitle}>צ'ק-אין יומי</Text>
            </View>

            <Text style={s.sheetLabel}>איך אתה מרגיש?</Text>
            <View style={s.moodRow}>
              {MOODS.map((emoji, i) => (
                <TouchableOpacity key={i} onPress={() => setMood(i + 1)} activeOpacity={0.7}>
                  <Text style={{ fontSize: mood === i + 1 ? 38 : 28, opacity: mood === i + 1 ? 1 : 0.4 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sheetLabel}>רמת פיתוי היום: {temptation}/5</Text>
            <View style={s.temptRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setTemptation(n)} activeOpacity={0.7}
                  style={[s.temptBtn, temptation >= n && s.temptBtnActive]}>
                  <Text style={{ color: temptation >= n ? C.orange : C.dim, fontSize: 12, fontFamily: F.bold }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.sheetLabel}>טריגרים?</Text>
            <View style={s.triggerWrap}>
              {TRIGGERS.map(t => (
                <TouchableOpacity key={t} onPress={() => toggleTrigger(t)} activeOpacity={0.7}
                  style={[s.triggerChip, selected.includes(t) && s.triggerChipActive]}>
                  <Text style={[s.triggerText, selected.includes(t) && { color: C.orange }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={notes} onChangeText={setNotes}
              placeholder="הערות נוספות (אופציונלי)..."
              placeholderTextColor={C.dim}
              multiline numberOfLines={3}
              style={s.notesInput} textAlign="right" textAlignVertical="top"
            />

            <TouchableOpacity onPress={handleSubmit} style={s.submitBtn} activeOpacity={0.85}>
              <Text style={s.submitBtnText}>שמור +25 XP</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const SETBACK_TRIGGERS = ['שעמום', 'לחץ', 'בדידות', 'לילה מאוחר']

function SetbackModal({ onClose, currentStreak, totalCleanDays }: {
  onClose: () => void
  currentStreak: number
  totalCleanDays: number
}) {
  const { reportSetback } = useStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [trigger, setTrigger] = useState('')
  const fadeAnim = useRef(new Animated.Value(1)).current

  const goTo = (next: 1 | 2 | 3) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
    setTimeout(() => setStep(next), 150)
  }

  const handleFinish = () => {
    reportSetback(trigger, '')
    onClose()
  }

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.setbackSheet}>

          {/* Step indicator */}
          <View style={s.stepDots}>
            {([1, 2, 3] as const).map(n => (
              <View key={n} style={[s.stepDot, step === n && s.stepDotActive]} />
            ))}
          </View>

          <Animated.View style={[s.stepContent, { opacity: fadeAnim }]}>

            {/* ── שלב 1: חיבוק ──────────────────────────── */}
            {step === 1 && (
              <>
                <Text style={s.sbEmoji}>🤝</Text>
                <Text style={s.sbTitle}>זה חלק מהמסע</Text>
                <Text style={s.sbBody}>כל לוחם נפל.{'\n'}מה שמבדיל אותך הוא שקמת.</Text>
                <TouchableOpacity style={s.sbPrimary} onPress={() => goTo(2)} activeOpacity={0.85}>
                  <Text style={s.sbPrimaryText}>אני קם</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── שלב 2: הבנה ───────────────────────────── */}
            {step === 2 && (
              <>
                <Text style={s.sbQuestion}>מה גרם לזה?</Text>
                <View style={s.triggerGrid}>
                  {SETBACK_TRIGGERS.map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTrigger(t)}
                      style={[s.triggerCard, trigger === t && s.triggerCardActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.triggerCardText, trigger === t && s.triggerCardTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[s.sbPrimary, !trigger && s.sbPrimaryDisabled]}
                  onPress={() => trigger && goTo(3)}
                  activeOpacity={0.85}
                >
                  <Text style={s.sbPrimaryText}>המשך</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── שלב 3: חזרה למסלול ────────────────────── */}
            {step === 3 && (
              <>
                <Text style={s.sbTitle}>הסטריק שלך מתאפס —{'\n'}אבל לא הניקוד</Text>
                <Text style={s.sbBody}>כל יום נקי שצברת נשאר בהיסטוריה שלך</Text>
                <View style={s.cleanDaysBox}>
                  <Text style={s.cleanDaysNum}>{totalCleanDays + currentStreak}</Text>
                  <Text style={s.cleanDaysLabel}>ימים נקיים שנצברו סה״כ</Text>
                </View>
                <TouchableOpacity style={s.sbGreen} onPress={handleFinish} activeOpacity={0.85}>
                  <Text style={s.sbGreenText}>מתחיל עכשיו מחדש 🔥</Text>
                </TouchableOpacity>
              </>
            )}

          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

function JournalSection({ entries }: { entries: TriggerEntry[] }) {
  if (entries.length === 0) return null
  const recent = entries.slice(0, 7)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
  }

  return (
    <View style={s.journalCard}>
      <Text style={s.journalTitle}>יומן דחפים</Text>
      {recent.map(entry => (
        <View key={entry.id} style={s.journalRow}>
          <View style={s.journalLeft}>
            <Text style={s.journalDate}>{formatDate(entry.date)}</Text>
          </View>
          <View style={s.journalMid}>
            {entry.hadUrge ? (
              <>
                <Text style={s.journalTrigger}>{entry.trigger}</Text>
                {entry.note ? <Text style={s.journalNote}>{entry.note}</Text> : null}
              </>
            ) : (
              <Text style={s.journalNoUrge}>ללא דחף</Text>
            )}
          </View>
          <View style={s.journalRight}>
            {!entry.hadUrge ? (
              <Text style={[s.journalBadge, s.journalBadgeGreen]}>✓</Text>
            ) : entry.resisted ? (
              <Text style={[s.journalBadge, s.journalBadgeGreen]}>✓</Text>
            ) : (
              <Text style={[s.journalBadge, s.journalBadgeRed]}>✗</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}

export default function InsightsTab() {
  const { currentStreak, longestStreak, totalCleanDays, resilience, checkins, tasks, triggerJournal, setbacks } = useStore()
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [setbackOpen, setSetbackOpen] = useState(false)

  const tasksCompleted = tasks.filter(t => t.isCompleted).length
  const patternUnlockIn = Math.max(0, 7 - checkins.length)

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>תובנות</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <WeeklyProgress journal={triggerJournal} setbacks={setbacks} />
        <StreakDisplay streak={currentStreak} longestStreak={longestStreak} />

        <View style={s.metricsRow}>
          <MetricCard icon="🧱" value={resilience} label="חוסן" sub="לא מתאפס" />
          <MetricCard icon="✅" value={tasksCompleted} label="משימות" />
          <MetricCard icon="📊" value={checkins.length} label="צ'ק-אין" />
        </View>

        {/* Daily Check-in */}
        <View style={s.actionCard}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.actionTitle}>צ'ק-אין יומי</Text>
            <Text style={s.actionSub}>30 שניות לתיעוד היום</Text>
          </View>
          <TouchableOpacity onPress={() => setCheckinOpen(true)} style={s.actionBtn} activeOpacity={0.85}>
            <Text style={s.actionBtnText}>+ צ'ק-אין</Text>
          </TouchableOpacity>
        </View>

        {/* Patterns */}
        <View style={[s.patternCard, patternUnlockIn > 0 && { opacity: 0.5 }]}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.actionTitle}>זיהוי דפוסים</Text>
            <Text style={s.actionSub}>
              {patternUnlockIn > 0 ? `נפתח בעוד ${patternUnlockIn} צ'ק-אינים` : 'פתוח!'}
            </Text>
          </View>
          {patternUnlockIn > 0 && (
            <View>
              <Text style={{ color: C.dim, fontSize: 20 }}>🔒</Text>
              <View style={s.patternBar}>
                <View style={[s.patternFill, { width: `${(checkins.length / 7) * 100}%` }]} />
              </View>
              <Text style={s.patternCount}>{checkins.length}/7</Text>
            </View>
          )}
        </View>

        {/* Setback */}
        <View style={s.actionCard}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.actionTitle}>נפילות</Text>
            <Text style={s.actionSub}>תעד כדי לצמוח</Text>
          </View>
          <TouchableOpacity onPress={() => setSetbackOpen(true)} style={s.setbackBtn} activeOpacity={0.85}>
            <Text style={s.setbackBtnText}>הייתה לי נפילה</Text>
          </TouchableOpacity>
        </View>

        {/* Recent checkins */}
        {checkins.length > 0 && (
          <View style={s.historyCard}>
            <Text style={s.historyTitle}>צ'ק-אינים אחרונים</Text>
            {checkins.slice(0, 3).map(ci => (
              <View key={ci.id} style={s.historyRow}>
                <Text style={s.historyDate}>{new Date(ci.createdAt).toLocaleDateString('he-IL')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {ci.triggers.length > 0 && <Text style={s.historyTriggers}>{ci.triggers.slice(0, 2).join(', ')}</Text>}
                  <Text style={{ fontSize: 20 }}>{MOODS[ci.mood - 1]}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <JournalSection entries={triggerJournal} />

        <View style={{ height: 30 }} />
      </ScrollView>

      {checkinOpen && <CheckinModal onClose={() => setCheckinOpen(false)} />}
      {setbackOpen && (
        <SetbackModal
          onClose={() => setSetbackOpen(false)}
          currentStreak={currentStreak}
          totalCleanDays={totalCleanDays}
        />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right' },
  scrollContent: { paddingHorizontal: 16, gap: 12 },

  streakCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 32, alignItems: 'center', overflow: 'hidden' },
  streakGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(249,115,22,0.12)' },
  streakNumber: { fontSize: 72, fontFamily: F.black, lineHeight: 80 },
  streakLabel: { fontSize: 18, color: C.muted, fontFamily: F.regular, marginTop: 8 },
  streakRecord: { fontSize: 12, color: C.dim, fontFamily: F.regular, marginTop: 8 },

  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center' },
  metricIcon: { fontSize: 24, marginBottom: 4 },
  metricValue: { fontSize: 22, fontFamily: F.black, color: C.text },
  metricLabel: { fontSize: 11, color: C.dim, fontFamily: F.regular, marginTop: 2 },
  metricSub: { fontSize: 10, color: '#333', fontFamily: F.regular },

  actionCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionTitle: { fontSize: 15, fontFamily: F.bold, color: C.text },
  actionSub: { fontSize: 12, color: C.dim, fontFamily: F.regular, marginTop: 2 },
  actionBtn: { backgroundColor: C.orange, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  actionBtnText: { color: '#fff', fontSize: 14, fontFamily: F.bold },
  setbackBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#2a2a2a' },
  setbackBtnText: { color: '#ffffff', fontSize: 14, fontFamily: F.bold },

  patternCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patternBar: { backgroundColor: '#111', borderRadius: 8, height: 6, overflow: 'hidden', width: 60, marginTop: 6 },
  patternFill: { height: '100%', backgroundColor: C.orange, borderRadius: 8 },
  patternCount: { fontSize: 11, color: C.dim, textAlign: 'right', marginTop: 3, fontFamily: F.regular },

  historyCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  historyTitle: { fontSize: 14, fontFamily: F.bold, color: C.muted, textAlign: 'right', marginBottom: 10 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  historyDate: { fontSize: 11, color: C.dim, fontFamily: F.regular },
  historyTriggers: { fontSize: 12, color: C.dim, fontFamily: F.regular },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 20, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 18, fontFamily: F.bold, color: C.text },
  sheetLabel: { fontSize: 14, color: C.muted, fontFamily: F.regular, textAlign: 'right', marginBottom: 12 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  temptRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  temptBtn: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  temptBtnActive: { borderColor: C.orange, backgroundColor: C.orangeDim },
  triggerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'flex-end' },
  triggerChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: '#333', backgroundColor: '#111' },
  triggerChipActive: { borderColor: C.orange, backgroundColor: C.orangeDim },
  triggerText: { fontSize: 13, color: C.muted, fontFamily: F.regular },
  notesInput: { backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, color: C.text, fontSize: 15, fontFamily: F.regular },
  submitBtn: { backgroundColor: C.orange, borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontFamily: F.bold },
  // Setback modal
  setbackSheet: {
    backgroundColor: '#0d0d0d', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 44, minHeight: 420,
  },
  stepDots:    { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  stepDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a2a2a' },
  stepDotActive: { backgroundColor: '#FF6B2C', width: 24 },
  stepContent: { alignItems: 'center', gap: 16 },

  sbEmoji:   { fontSize: 64, marginBottom: 4 },
  sbTitle:   { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'center', lineHeight: 30 },
  sbQuestion:{ fontSize: 20, fontFamily: F.black, color: C.text, textAlign: 'center', marginBottom: 8 },
  sbBody:    { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'center', lineHeight: 24 },

  triggerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginVertical: 8 },
  triggerCard: {
    paddingVertical: 14, paddingHorizontal: 22,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#2a2a2a',
    backgroundColor: '#141414',
  },
  triggerCardActive:     { borderColor: '#FF6B2C', backgroundColor: 'rgba(255,107,44,0.12)' },
  triggerCardText:       { fontSize: 15, fontFamily: F.bold, color: C.muted },
  triggerCardTextActive: { color: '#FF6B2C' },

  cleanDaysBox: {
    backgroundColor: '#141414', borderRadius: 18, borderWidth: 1,
    borderColor: '#2a2a2a', paddingVertical: 20, paddingHorizontal: 40,
    alignItems: 'center', gap: 4, marginVertical: 8,
  },
  cleanDaysNum:   { fontSize: 52, fontFamily: F.black, color: C.text },
  cleanDaysLabel: { fontSize: 12, fontFamily: F.bold, color: C.dim, letterSpacing: 1 },

  sbPrimary:         { width: '100%', backgroundColor: '#FF6B2C', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  sbPrimaryDisabled: { backgroundColor: '#2a2a2a' },
  sbPrimaryText:     { color: '#fff', fontSize: 16, fontFamily: F.black },
  sbGreen:           { width: '100%', backgroundColor: C.green, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  sbGreenText:       { color: '#fff', fontSize: 16, fontFamily: F.black },

  // Journal
  journalCard:  { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  journalTitle: { fontSize: 14, fontFamily: F.bold, color: C.muted, textAlign: 'right', marginBottom: 10 },
  journalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
    gap: 8,
  },
  journalLeft:    { width: 36, alignItems: 'center' },
  journalMid:     { flex: 1, alignItems: 'flex-end', gap: 2 },
  journalRight:   { width: 28, alignItems: 'center' },
  journalDate:    { fontSize: 11, color: C.dim, fontFamily: F.regular },
  journalTrigger: { fontSize: 13, color: C.text, fontFamily: F.bold, textAlign: 'right' },
  journalNote:    { fontSize: 11, color: C.dim, fontFamily: F.regular, textAlign: 'right' },
  journalNoUrge:  { fontSize: 13, color: C.dim, fontFamily: F.regular },
  journalBadge:   { fontSize: 15, fontFamily: F.black },
  journalBadgeGreen: { color: C.green },
  journalBadgeRed:   { color: C.red },
})
