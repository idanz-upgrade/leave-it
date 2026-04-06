import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Linking, ScrollView,
} from 'react-native'
import { F } from '@/lib/theme'

const TOTAL_SECONDS = 10 * 60
const SOS_ORANGE    = '#FF6B2C'

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ── Breathing animation ───────────────────────────────────────────────────────
function BreathingCircle({ scrollRef }: { scrollRef: React.RefObject<ScrollView> }) {
  const size    = useRef(new Animated.Value(60)).current
  const [phase, setPhase] = useState<'שאף...' | 'עצור...' | 'נשוף...'>('שאף...')

  useEffect(() => {
    let cancelled = false

    const cycle = () => {
      if (cancelled) return
      setPhase('שאף...')
      Animated.timing(size, { toValue: 90, duration: 4000, useNativeDriver: false }).start(() => {
        if (cancelled) return
        setPhase('עצור...')
        setTimeout(() => {
          if (cancelled) return
          setPhase('נשוף...')
          Animated.timing(size, { toValue: 60, duration: 4000, useNativeDriver: false }).start(() => {
            if (!cancelled) cycle()
          })
        }, 1500)
      })
    }
    cycle()
    return () => { cancelled = true }
  }, [])

  return (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <Text style={s.breathLabel}>תרגיל נשימה</Text>
      <Animated.View style={[s.breathCircle, { width: size, height: size, borderRadius: Animated.divide(size, 2) as any }]}>
        <Text style={s.breathPhase}>{phase}</Text>
      </Animated.View>
      <TouchableOpacity
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        activeOpacity={0.7}
        style={{ marginTop: 8 }}
      >
        <Text style={{ color: SOS_ORANGE, fontSize: 11, fontFamily: F.bold }}>התמקד בנשימה ↑</Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Action cards ──────────────────────────────────────────────────────────────
const ACTIONS: { label: string; emoji: string; onPress: () => void }[] = [
  {
    label: 'צא להליכה',
    emoji: '🏃',
    onPress: () => {
      const url = __DEV__ ? 'https://maps.google.com' : 'maps://'
      Linking.openURL(url).catch(() =>
        Linking.openURL('https://maps.google.com').catch(() => {})
      )
    },
  },
  {
    label: 'פתח מוזיקה',
    emoji: '🎵',
    onPress: () => Linking.openURL('spotify://').catch(() =>
      Linking.openURL('music://').catch(() => {})
    ),
  },
  {
    label: 'שלח הודעה',
    emoji: '📱',
    onPress: () => Linking.openURL('whatsapp://').catch(() => {}),
  },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function SOSModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS)
  const [running, setRunning] = useState(false)
  const pulse        = useRef(new Animated.Value(1)).current
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef    = useRef<ScrollView>(null)

  // Pulse when running
  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulse.stopAnimation()
      pulse.setValue(1)
    }
  }, [running])

  // Countdown
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  // Reset on open
  useEffect(() => {
    if (visible) {
      setSeconds(TOTAL_SECONDS)
      setRunning(false)
    }
  }, [visible])

  const done = seconds === 0

  // ── Completed state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={[s.container, { justifyContent: 'center', gap: 24 }]}>
          <Text style={s.doneIcon}>💪</Text>
          <Text style={s.doneTitle}>עברת את זה</Text>
          <Text style={s.doneSub}>יום נקי נוסף. אתה חזק מזה.</Text>
          <TouchableOpacity onPress={onClose} style={s.doneBtn} activeOpacity={0.88}>
            <Text style={s.doneBtnText}>סגור וחזור למסע</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>עצור. נשום. אתה חזק מזה.</Text>
            <Text style={s.subtitle}>ממוצע: 15–20 דקות. תעצור איתי 10 דקות.</Text>
          </View>

          {/* Breathing exercise */}
          <BreathingCircle scrollRef={scrollRef} />

          {/* Timer */}
          <TouchableOpacity onPress={() => setRunning(r => !r)} activeOpacity={0.85} style={{ alignItems: 'center' }}>
            <Animated.View style={[s.timerRing, { transform: [{ scale: pulse }] }, running && s.timerRingActive]}>
              <Text style={s.timerText}>{fmt(seconds)}</Text>
              <Text style={s.timerHint}>{running ? 'לחץ להפסקה' : 'לחץ להתחלה'}</Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Action cards */}
          <View style={s.grid}>
            {ACTIONS.map(a => (
              <TouchableOpacity key={a.label} onPress={a.onPress} style={s.card} activeOpacity={0.8}>
                <Text style={s.cardEmoji}>{a.emoji}</Text>
                <Text style={s.cardLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
            {/* Breathing card — scrolls to top */}
            <TouchableOpacity
              onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
              style={s.card}
              activeOpacity={0.8}
            >
              <Text style={s.cardEmoji}>🌬️</Text>
              <Text style={s.cardLabel}>נשימה מודרכת</Text>
            </TouchableOpacity>
          </View>

          {/* Close */}
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.85}>
            <Text style={s.closeBtnText}>סגור</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0a',
  },
  scroll: {
    paddingHorizontal: 24, paddingTop: 48, paddingBottom: 36,
    alignItems: 'center', gap: 24,
  },

  header: { alignItems: 'center', gap: 10 },
  title:    { fontSize: 24, fontFamily: F.black, color: '#ffffff', textAlign: 'center', lineHeight: 32 },
  subtitle: { fontSize: 14, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', lineHeight: 22 },

  // Breathing
  breathLabel: { fontSize: 11, fontFamily: F.bold, color: '#8b8b9e', letterSpacing: 1.5, marginBottom: 12 },
  breathCircle: {
    backgroundColor: 'rgba(255,107,44,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  breathPhase: { fontSize: 13, fontFamily: F.bold, color: '#fff', textAlign: 'center' },

  // Timer
  timerRing: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 4, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#141414',
  },
  timerRingActive: { borderColor: SOS_ORANGE, shadowColor: SOS_ORANGE, shadowOpacity: 0.4, shadowRadius: 20 },
  timerText: { fontSize: 42, fontFamily: F.black, color: '#ffffff', letterSpacing: 2 },
  timerHint: { fontSize: 11, fontFamily: F.regular, color: '#8b8b9e', letterSpacing: 1 },

  // Action grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    width: '100%', justifyContent: 'center',
  },
  card: {
    width: '46%', backgroundColor: '#141414',
    borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a',
    padding: 20, alignItems: 'center', gap: 10,
  },
  cardEmoji: { fontSize: 32 },
  cardLabel: { fontSize: 14, fontFamily: F.bold, color: '#e2e2e8', textAlign: 'center' },

  // Close
  closeBtn: {
    width: '100%', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontFamily: F.bold, color: '#8b8b9e' },

  // Done state
  doneIcon:    { fontSize: 80, textAlign: 'center' },
  doneTitle:   { fontSize: 34, fontFamily: F.black, color: '#fff', textAlign: 'center' },
  doneSub:     { fontSize: 16, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', lineHeight: 24 },
  doneBtn: {
    width: '100%', backgroundColor: '#22c55e',
    borderRadius: 16, padding: 20, alignItems: 'center',
  },
  doneBtnText: { fontSize: 17, fontFamily: F.black, color: '#fff' },
})
