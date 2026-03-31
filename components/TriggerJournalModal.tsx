import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  TextInput, Animated, ScrollView,
} from 'react-native'
import { TriggerEntry } from '@/lib/store'
import { C, F } from '@/lib/theme'

const TRIGGER_OPTIONS = ['שעמום', 'לחץ', 'בדידות', 'לילה מאוחר', 'אחר']

type EntryData = Omit<TriggerEntry, 'id' | 'date'>

interface Props {
  visible: boolean
  onComplete: (data: EntryData) => void
}

export default function TriggerJournalModal({ visible, onComplete }: Props) {
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1)
  const [hadUrge, setHadUrge] = useState(false)
  const [trigger, setTrigger] = useState('')
  const [resisted, setResisted] = useState(false)
  const [note, setNote]       = useState('')
  const fadeAnim = useRef(new Animated.Value(1)).current

  const fade = (next: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start()
    setTimeout(next, 120)
  }

  const reset = () => {
    setStep(1); setHadUrge(false); setTrigger(''); setResisted(false); setNote('')
    fadeAnim.setValue(1)
  }

  const handleNo = () => {
    reset()
    onComplete({ hadUrge: false })
  }

  const handleYes = () => {
    setHadUrge(true)
    fade(() => setStep(2))
  }

  const handleTrigger = (t: string) => {
    setTrigger(t)
    fade(() => setStep(3))
  }

  const handleResisted = (did: boolean) => {
    setResisted(did)
    fade(() => setStep(4))
  }

  const handleSubmit = () => {
    const data: EntryData = { hadUrge: true, trigger, resisted, note: note.trim() || undefined }
    reset()
    onComplete(data)
  }

  const totalSteps = 4
  const currentStep = step

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          {/* Step dots */}
          <View style={s.dots}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <View key={i} style={[s.dot, currentStep === i + 1 && s.dotActive]} />
            ))}
          </View>

          <Animated.View style={[s.content, { opacity: fadeAnim }]}>

            {/* ── Step 1: Had urge? ── */}
            {step === 1 && (
              <>
                <Text style={s.question}>היה לך דחף היום?</Text>
                <View style={s.bigBtnRow}>
                  <TouchableOpacity onPress={handleYes} style={[s.bigBtn, s.bigBtnYes]} activeOpacity={0.85}>
                    <Text style={s.bigBtnText}>כן</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNo} style={[s.bigBtn, s.bigBtnNo]} activeOpacity={0.85}>
                    <Text style={[s.bigBtnText, { color: C.text }]}>לא</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Step 2: Trigger ── */}
            {step === 2 && (
              <>
                <Text style={s.question}>מה גרם לו?</Text>
                <View style={s.grid}>
                  {TRIGGER_OPTIONS.map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => handleTrigger(t)}
                      style={[s.chip, trigger === t && s.chipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.chipText, trigger === t && s.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ── Step 3: Resisted? ── */}
            {step === 3 && (
              <>
                <Text style={s.question}>הצלחת לעמוד בו?</Text>
                <View style={s.resistCol}>
                  <TouchableOpacity onPress={() => handleResisted(true)} style={s.resistYes} activeOpacity={0.85}>
                    <Text style={s.resistYesText}>כן, עמדתי בו 💪</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleResisted(false)} style={s.resistNo} activeOpacity={0.85}>
                    <Text style={s.resistNoText}>לא, נפלתי</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Step 4: Note (optional) ── */}
            {step === 4 && (
              <>
                <Text style={s.question}>רוצה להוסיף משהו?</Text>
                <Text style={s.optional}>(אופציונלי)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="מה עזר לך? מה היה קשה?"
                  placeholderTextColor={C.dim}
                  style={s.noteInput}
                  textAlign="right"
                  textAlignVertical="top"
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity onPress={handleSubmit} style={s.submitBtn} activeOpacity={0.85}>
                  <Text style={s.submitText}>שמור</Text>
                </TouchableOpacity>
              </>
            )}

          </Animated.View>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: '#ffffff0a',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48,
    minHeight: 320,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a2a2a' },
  dotActive: { width: 24, backgroundColor: '#FF6B2C' },

  content: { alignItems: 'center', gap: 20 },

  question: {
    fontSize: 22, fontFamily: F.black, color: C.text,
    textAlign: 'center', lineHeight: 30,
  },
  optional: { fontSize: 13, color: C.dim, fontFamily: F.regular, marginTop: -12 },

  bigBtnRow: { flexDirection: 'row', gap: 14, width: '100%' },
  bigBtn:    { flex: 1, paddingVertical: 22, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bigBtnYes: { backgroundColor: '#FF6B2C' },
  bigBtnNo:  { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#2a2a2a' },
  bigBtnText:{ fontSize: 20, fontFamily: F.black, color: '#fff' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', width: '100%',
  },
  chip: {
    paddingVertical: 14, paddingHorizontal: 22,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#2a2a2a',
    backgroundColor: '#141414',
  },
  chipActive:     { borderColor: '#FF6B2C', backgroundColor: 'rgba(255,107,44,0.12)' },
  chipText:       { fontSize: 15, fontFamily: F.bold, color: C.muted },
  chipTextActive: { color: '#FF6B2C' },

  resistCol: { width: '100%', gap: 12 },
  resistYes: {
    backgroundColor: '#22c55e', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  resistYesText: { color: '#fff', fontSize: 17, fontFamily: F.black },
  resistNo: {
    backgroundColor: '#1e1e1e', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a',
    paddingVertical: 18, alignItems: 'center',
  },
  resistNoText: { color: C.muted, fontSize: 17, fontFamily: F.bold },

  noteInput: {
    width: '100%', backgroundColor: '#141414',
    borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12,
    padding: 14, color: C.text, fontSize: 15, fontFamily: F.regular,
    minHeight: 90,
  },
  submitBtn: {
    width: '100%', backgroundColor: '#FF6B2C', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 17, fontFamily: F.black },
})
