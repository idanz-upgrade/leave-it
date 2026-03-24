import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, SafeAreaView, Animated,
} from 'react-native'
import { useStore } from '@/lib/store'
import { C, F } from '@/lib/theme'

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
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <View style={s.sheetHeader}>
            <TouchableOpacity onPress={onClose}><Text style={{ color: C.dim, fontSize: 20 }}>✕</Text></TouchableOpacity>
            <Text style={[s.sheetTitle, { color: C.red }]}>תיעוד נפילה</Text>
          </View>

          <View style={s.recoveryBox}>
            <Text style={s.recoveryText}>💪 החלמה אינה ליניארית. כל נפילה היא הזדמנות ללמוד ולחזור חזק יותר.</Text>
          </View>

          <TextInput
            value={trigger} onChangeText={setTrigger}
            placeholder="מה גרם לנפילה? (שעמום, לחץ...)"
            placeholderTextColor={C.dim}
            style={s.notesInput} textAlign="right"
          />
          <TextInput
            value={notes} onChangeText={setNotes}
            placeholder="הערות..."
            placeholderTextColor={C.dim}
            multiline numberOfLines={3}
            style={[s.notesInput, { marginTop: 10, marginBottom: 20 }]}
            textAlign="right" textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={[s.submitBtn, confirmed ? { backgroundColor: C.red } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.red }]}
            activeOpacity={0.85}
          >
            <Text style={[s.submitBtnText, !confirmed && { color: C.red }]}>
              {confirmed ? 'אישור — אפס את ה-Streak' : 'הייתה לי נפילה'}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default function InsightsTab() {
  const { currentStreak, longestStreak, resilience, checkins, tasks } = useStore()
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
            <Text style={s.actionTitle}>SETBACKS</Text>
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

        <View style={{ height: 30 }} />
      </ScrollView>

      {checkinOpen && <CheckinModal onClose={() => setCheckinOpen(false)} />}
      {setbackOpen && <SetbackModal onClose={() => setSetbackOpen(false)} />}
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
  setbackBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: C.red },
  setbackBtnText: { color: C.red, fontSize: 14, fontFamily: F.bold },

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
  recoveryBox: { backgroundColor: C.redDim, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 },
  recoveryText: { color: '#f87171', fontSize: 15, fontFamily: F.regular, textAlign: 'right', lineHeight: 22 },
})
