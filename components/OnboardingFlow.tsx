import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native'
import Slider from '@react-native-community/slider'
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useStore, OnboardingData } from '@/lib/store'
import { C, F } from '@/lib/theme'

const STEPS = 6

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={s.progressRow}>
      {Array.from({ length: STEPS }).map((_, i) => (
        <View key={i} style={[s.progressSegment, { backgroundColor: i < step ? C.orange : C.border }]} />
      ))}
    </View>
  )
}

function RadioOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.radioOption, selected && s.radioOptionSelected]}
      activeOpacity={0.8}
    >
      <Text style={[s.radioLabel, selected && { color: C.orange }]}>{label}</Text>
      <View style={[s.radioCircle, selected && s.radioCircleSelected]} />
    </TouchableOpacity>
  )
}

function StepWrapper({
  title, subtitle, children, onNext, onBack, canContinue, step,
}: {
  title: string; subtitle?: string; children: React.ReactNode
  onNext: () => void; onBack: () => void; canContinue: boolean; step: number
}) {
  return (
    <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)} style={{ flex: 1 }}>
      <View style={s.stepContent}>
        <Text style={s.stepTitle}>{title}</Text>
        {subtitle && <Text style={s.stepSubtitle}>{subtitle}</Text>}
      </View>
      <View style={s.stepOptions}>{children}</View>
      <TouchableOpacity
        onPress={canContinue ? onNext : undefined}
        style={[s.continueBtn, !canContinue && s.continueBtnDisabled]}
        activeOpacity={canContinue ? 0.85 : 1}
      >
        <Text style={[s.continueBtnText, !canContinue && { color: C.dim }]}>המשך</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

function Step1({ onNext, onBack, step }: { onNext: (v: string) => void; onBack: () => void; step: number }) {
  const [sel, setSel] = useState('')
  const opts = ['פחות מ-6 חודשים', 'חצי שנה עד שנה', '1-3 שנים', 'יותר מ-3 שנים']
  return (
    <StepWrapper title="כמה זמן ההרגל הזה נמשך?" onNext={() => onNext(sel)} onBack={onBack} canContinue={!!sel} step={step}>
      {opts.map(o => <RadioOption key={o} label={o} selected={sel === o} onPress={() => setSel(o)} />)}
    </StepWrapper>
  )
}

function Step2({ onNext, onBack, step }: { onNext: (v: string) => void; onBack: () => void; step: number }) {
  const [sel, setSel] = useState('')
  const opts = ['כל יום', 'כמה פעמים בשבוע', 'פעם בשבוע', 'לעיתים רחוקות']
  return (
    <StepWrapper title="באיזו תדירות זה קורה?" onNext={() => onNext(sel)} onBack={onBack} canContinue={!!sel} step={step}>
      {opts.map(o => <RadioOption key={o} label={o} selected={sel === o} onPress={() => setSel(o)} />)}
    </StepWrapper>
  )
}

function Step3({ onNext, onBack, step }: { onNext: (v: number) => void; onBack: () => void; step: number }) {
  const [age, setAge] = useState(25)
  return (
    <StepWrapper title="בן כמה אתה?" onNext={() => onNext(age)} onBack={onBack} canContinue step={step}>
      <View style={s.ageContainer}>
        <Text style={s.ageValue}>{age}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={14}
          maximumValue={70}
          step={1}
          value={age}
          onValueChange={v => setAge(v)}
          minimumTrackTintColor={C.orange}
          maximumTrackTintColor={C.border}
          thumbTintColor={C.orange}
        />
        <View style={s.ageRange}>
          <Text style={s.ageRangeText}>70</Text>
          <Text style={s.ageRangeText}>14</Text>
        </View>
      </View>
    </StepWrapper>
  )
}

function Step4({ onNext, onBack, step }: { onNext: (v: string) => void; onBack: () => void; step: number }) {
  const [sel, setSel] = useState('')
  const opts = ['שיפור עצמי', 'סיבות דתיות', 'אחר']
  return (
    <StepWrapper title="מהי המטרה העיקרית שלך?" onNext={() => onNext(sel)} onBack={onBack} canContinue={!!sel} step={step}>
      {opts.map(o => <RadioOption key={o} label={o} selected={sel === o} onPress={() => setSel(o)} />)}
    </StepWrapper>
  )
}

function Step5({ onNext, onBack, step }: { onNext: (v: string) => void; onBack: () => void; step: number }) {
  const [text, setText] = useState('')
  return (
    <StepWrapper
      title="ההתחייבות שלי"
      subtitle="למה אתה רוצה לשנות? משפט אחד שיחזיר אותך למסלול."
      onNext={() => onNext(text)} onBack={onBack} canContinue={text.trim().length > 3} step={step}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="למשל: אני עושה את זה כדי להיות אבא טוב יותר..."
        placeholderTextColor={C.dim}
        multiline
        numberOfLines={4}
        style={s.textArea}
        textAlign="right"
        textAlignVertical="top"
      />
    </StepWrapper>
  )
}

function Step6({ onNext, onBack, step }: { onNext: (v: 'secular' | 'religious') => void; onBack: () => void; step: number }) {
  const [sel, setSel] = useState<'secular' | 'religious'>('secular')
  return (
    <StepWrapper title="בחר סגנון שפה" subtitle="נתאים את האפליקציה לסגנון שמדבר אליך." onNext={() => onNext(sel)} onBack={onBack} canContinue step={step}>
      <TouchableOpacity onPress={() => setSel('secular')} style={[s.styleCard, sel === 'secular' && s.styleCardSelected]} activeOpacity={0.8}>
        <Text style={s.styleCardTitle}>🧘 חילוני</Text>
        <Text style={s.styleCardDesc}>שיפור עצמי, דופמין דיטוקס, משמעת עצמית</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setSel('religious')} style={[s.styleCard, sel === 'religious' && s.styleCardSelected]} activeOpacity={0.8}>
        <Text style={s.styleCardTitle}>✡️ דתי / מסורתי</Text>
        <Text style={s.styleCardDesc}>שמירת הברית, שמירת עיניים, קדושה</Text>
      </TouchableOpacity>
    </StepWrapper>
  )
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const { completeOnboarding } = useStore()

  const handleNext = (value: string | number) => {
    const keys = ['habitDuration', 'frequency', 'age', 'mainGoal', 'yourWhy', 'languageStyle']
    const newAnswers = { ...answers, [keys[step]]: value }
    setAnswers(newAnswers)
    if (step < STEPS - 1) {
      setStep(step + 1)
    } else {
      completeOnboarding({
        habitDuration: newAnswers.habitDuration as string,
        frequency: newAnswers.frequency as string,
        age: newAnswers.age as number,
        mainGoal: newAnswers.mainGoal as string,
        yourWhy: newAnswers.yourWhy as string,
        languageStyle: newAnswers.languageStyle as 'secular' | 'religious',
      })
      router.replace('/(tabs)')
    }
  }

  const handleBack = () => { if (step > 0) setStep(step - 1) }

  const steps = [Step1, Step2, Step3, Step4, Step5, Step6]
  const CurrentStep = steps[step]

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backBtnText}>→</Text>
            </TouchableOpacity>
          )}
          <Text style={s.logoText}>שליטה</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProgressBar step={step + 1} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <CurrentStep onNext={handleNext as any} onBack={handleBack} step={step} />
        </ScrollView>

        <Text style={s.stepCounter}>שלב {step + 1} מתוך {STEPS}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  logoText: { fontSize: 22, fontFamily: F.black, color: C.orange },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 20, color: C.muted },
  progressRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 6, marginBottom: 4 },
  progressSegment: { flex: 1, height: 3, borderRadius: 99 },
  scrollContent: { padding: 24, paddingBottom: 40, flexGrow: 1 },
  stepContent: { marginBottom: 24 },
  stepTitle: { fontSize: 26, fontFamily: F.black, color: C.text, textAlign: 'right', lineHeight: 34 },
  stepSubtitle: { fontSize: 14, fontFamily: F.regular, color: C.muted, textAlign: 'right', marginTop: 8, lineHeight: 20 },
  stepOptions: { gap: 10, marginBottom: 24 },
  continueBtn: { backgroundColor: C.orange, borderRadius: 14, padding: 18, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: C.border },
  continueBtnText: { fontSize: 17, fontFamily: F.bold, color: '#fff' },
  radioOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card,
  },
  radioOptionSelected: { borderColor: C.orange, backgroundColor: C.orangeDim },
  radioLabel: { fontSize: 15, fontFamily: F.regular, color: C.text, textAlign: 'right', flex: 1 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#444', marginLeft: 12 },
  radioCircleSelected: { backgroundColor: C.orange, borderColor: C.orange },
  ageContainer: { alignItems: 'center', paddingVertical: 16 },
  ageValue: { fontSize: 72, fontFamily: F.black, color: C.orange, lineHeight: 80 },
  ageRange: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 },
  ageRangeText: { fontSize: 13, color: C.dim, fontFamily: F.regular },
  textArea: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    padding: 16, color: C.text, fontSize: 15, fontFamily: F.regular, minHeight: 120,
  },
  styleCard: {
    padding: 20, borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card, marginBottom: 12,
  },
  styleCardSelected: { borderColor: C.orange, backgroundColor: C.orangeDim },
  styleCardTitle: { fontSize: 18, fontFamily: F.bold, color: C.text, textAlign: 'right', marginBottom: 4 },
  styleCardDesc: { fontSize: 13, fontFamily: F.regular, color: C.muted, textAlign: 'right' },
  stepCounter: { textAlign: 'center', color: '#333', fontSize: 12, fontFamily: F.regular, paddingBottom: 16 },
})
