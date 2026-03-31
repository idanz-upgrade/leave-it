import React, { useState, useEffect, useRef } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native'
import { F } from '@/lib/theme'

const TOTAL_SECONDS = 10 * 60

const ACTIONS = [
  { label: 'הליכה קצרה', emoji: '🏃' },
  { label: 'מוזיקה',      emoji: '🎵' },
  { label: 'כוס מים',    emoji: '💧' },
  { label: 'שלח הודעה',  emoji: '📞' },
]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function SOSModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS)
  const [running, setRunning] = useState(false)
  const pulse = useRef(new Animated.Value(1)).current
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Pulse animation when running
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

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSeconds(TOTAL_SECONDS)
      setRunning(false)
    }
  }, [visible])

  const progress = seconds / TOTAL_SECONDS
  const done = seconds === 0

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>הדחף הזה יעבור</Text>
          <Text style={s.subtitle}>ממוצע: 15–20 דקות. תעצור איתי 10 דקות.</Text>
        </View>

        {/* Timer */}
        <TouchableOpacity onPress={() => !done && setRunning(r => !r)} activeOpacity={0.85}>
          <Animated.View style={[s.timerRing, { transform: [{ scale: pulse }] },
            running && s.timerRingActive,
            done && s.timerRingDone,
          ]}>
            <Text style={[s.timerText, done && { color: '#22c55e' }]}>
              {done ? '✓' : fmt(seconds)}
            </Text>
            <Text style={s.timerHint}>
              {done ? 'עשית את זה!' : running ? 'לחץ להפסקה' : 'לחץ להתחלה'}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Action cards */}
        <View style={s.grid}>
          {ACTIONS.map(a => (
            <View key={a.label} style={s.card}>
              <Text style={s.cardEmoji}>{a.emoji}</Text>
              <Text style={s.cardLabel}>{a.label}</Text>
            </View>
          ))}
        </View>

        {/* Close */}
        <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.85}>
          <Text style={s.closeBtnText}>סגור</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  )
}

const SOS_ORANGE = '#FF6B2C'

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0a',
    paddingHorizontal: 24, paddingTop: 48, paddingBottom: 36,
    alignItems: 'center', justifyContent: 'space-between',
  },

  header: { alignItems: 'center', gap: 10 },
  title:  { fontSize: 28, fontFamily: F.black, color: '#ffffff', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: F.regular, color: '#8b8b9e', textAlign: 'center', lineHeight: 22 },

  timerRing: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 4, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#141414',
  },
  timerRingActive: { borderColor: SOS_ORANGE, shadowColor: SOS_ORANGE, shadowOpacity: 0.4, shadowRadius: 20 },
  timerRingDone:   { borderColor: '#22c55e' },
  timerText: { fontSize: 42, fontFamily: F.black, color: '#ffffff', letterSpacing: 2 },
  timerHint: { fontSize: 11, fontFamily: F.regular, color: '#8b8b9e', letterSpacing: 1 },

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

  closeBtn: {
    width: '100%', borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontFamily: F.bold, color: '#8b8b9e' },
})
