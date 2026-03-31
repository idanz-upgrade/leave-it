import React, { useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Dimensions, Animated,
} from 'react-native'
import { C, F } from '@/lib/theme'

const { width: W, height: H } = Dimensions.get('window')

const CONFETTI_COLORS = [
  '#FF6B2C', '#f97316', '#fbbf24', '#FF8C5A', '#FFD700', '#fb923c', '#ffffff',
]

function getSubtitle(streak: number): string {
  if (streak === 1)  return 'הצעד הראשון הוא הכי קשה. עשית אותו.'
  if (streak <= 6)   return 'כל יום בונה את האדם שאתה הופך להיות.'
  if (streak === 7)  return 'שבוע שלם. המוח שלך כבר משתנה.'
  if (streak === 30) return '30 יום. אתה לא אותו אדם שהתחיל.'
  return 'יום נוסף. ניצחון נוסף.'
}

interface ParticleCfg {
  x: number
  color: string
  size: number
  delay: number
  duration: number
}

// Fixed at module load — deterministic positions per session
const PARTICLES: ParticleCfg[] = Array.from({ length: 26 }, () => ({
  x:        Math.random() * W,
  color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  size:     4 + Math.random() * 7,
  delay:    Math.random() * 800,
  duration: 2000 + Math.random() * 1500,
}))

function ConfettiParticle({ cfg, run }: { cfg: ParticleCfg; run: boolean }) {
  const y       = useRef(new Animated.Value(-cfg.size)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!run) return
    y.setValue(-cfg.size)
    opacity.setValue(0)

    Animated.sequence([
      Animated.delay(cfg.delay),
      Animated.parallel([
        Animated.timing(y,       { toValue: H + 60,  duration: cfg.duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.delay(cfg.duration * 0.65),
          Animated.timing(opacity, { toValue: 0, duration: cfg.duration * 0.35, useNativeDriver: true }),
        ]),
      ]),
    ]).start()
  }, [run])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cfg.x,
        top: 0,
        width: cfg.size,
        height: cfg.size,
        borderRadius: cfg.size / 4,
        backgroundColor: cfg.color,
        transform: [{ translateY: y }],
        opacity,
      }}
    />
  )
}

interface Props {
  visible: boolean
  streak: number
  leveledUp: boolean
  newLevelName: string
  onClose: () => void
}

export default function VictoryModal({ visible, streak, leveledUp, newLevelName, onClose }: Props) {
  const slideY  = useRef(new Animated.Value(500)).current
  const fireScale = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    if (!visible) return

    slideY.setValue(500)
    fireScale.setValue(0.3)

    Animated.parallel([
      Animated.spring(slideY,   { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.spring(fireScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={s.backdrop}>
        {/* Confetti */}
        {PARTICLES.map((cfg, i) => (
          <ConfettiParticle key={i} cfg={cfg} run={visible} />
        ))}

        {/* Bottom sheet */}
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideY }] }]}>
          <Animated.Text style={[s.fire, { transform: [{ scale: fireScale }] }]}>
            🔥
          </Animated.Text>

          <Text style={s.title}>יום {streak} — הושלם!</Text>
          <Text style={s.subtitle}>{getSubtitle(streak)}</Text>

          {leveledUp && (
            <View style={s.levelUpBadge}>
              <Text style={s.levelUpText}>⬆️  עלית רמה — {newLevelName}</Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={s.btn} activeOpacity={0.85}>
            <Text style={s.btnText}>המשך</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: '#ffffff0a',
    paddingHorizontal: 28, paddingTop: 28, paddingBottom: 52,
    alignItems: 'center',
  },
  fire:     { fontSize: 80, marginBottom: 16 },
  title:    { fontSize: 28, fontFamily: F.black, color: C.text, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'center', lineHeight: 24, marginBottom: 20 },

  levelUpBadge: {
    backgroundColor: C.orange + '18',
    borderWidth: 1, borderColor: C.orange + '50',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    marginBottom: 20,
  },
  levelUpText: { color: C.orange, fontSize: 14, fontFamily: F.bold, textAlign: 'center' },

  btn:     { backgroundColor: C.orange, borderRadius: 16, paddingHorizontal: 60, paddingVertical: 16, marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontFamily: F.black, letterSpacing: 0.5 },
})
