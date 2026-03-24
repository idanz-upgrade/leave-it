import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Animated,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { router } from 'expo-router'
import { useStore, OnboardingData } from '@/lib/store'
import { C, F } from '@/lib/theme'

// Step 0 = welcome (no data), Steps 1-6 = questions
const QUESTION_STEPS = 6
const TOTAL_STEPS = QUESTION_STEPS + 1 // include welcome

function ProgressDots({ current }: { current: number }) {
  // current is 0-indexed, dots only shown for question steps (1-6)
  if (current === 0) return null
  return (
    <View style={s.dotsRow}>
      {Array.from({ length: QUESTION_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            i < current - 1 ? s.dotDone : i === current - 1 ? s.dotActive : s.dotInactive,
          ]}
        />
      ))}
    </View>
  )
}

function OptionCard({
  label, sublabel, emoji, selected, onPress,
}: {
  label: string; sublabel?: string; emoji?: string; selected: boolean; onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.optionCard, selected && s.optionCardSelected]}
      activeOpacity={0.75}
    >
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={[s.optionLabel, selected && { color: C.orange }]}>{label}</Text>
        {sublabel ? <Text style={s.optionSublabel}>{sublabel}</Text> : null}
      </View>
      {emoji ? <Text style={s.optionEmoji}>{emoji}</Text> : null}
      {!emoji && (
        <View style={[s.checkCircle, selected && s.checkCircleSelected]}>
          {selected && <View style={s.checkInner} />}
        </View>
      )}
    </TouchableOpacity>
  )
}

function ContinueButton({ onPress, enabled, label = 'המשך' }: { onPress: () => void; enabled: boolean; label?: string }) {
  return (
    <TouchableOpacity
      onPress={enabled ? onPress : undefined}
      style={[s.continueBtn, !enabled && s.continueBtnDisabled]}
      activeOpacity={enabled ? 0.85 : 1}
    >
      <Text style={[s.continueBtnText, !enabled && { color: C.dim }]}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── Welcome ───────────────────────────────────────────────────────────────────
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const scale = useRef(new Animated.Value(0.8)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[{ flex: 1, opacity }, s.welcomeWrap]}>
      <View style={s.welcomeTop}>
        <Animated.Text style={[s.welcomeEmoji, { transform: [{ scale }] }]}>🛡️</Animated.Text>
        <Text style={s.welcomeTitle}>שליטה</Text>
        <Text style={s.welcomeTagline}>היה האיש שאתה יכול להיות</Text>
      </View>

      <View style={s.welcomeCards}>
        <View style={s.featureRow}>
          <View style={s.featureCard}>
            <Text style={s.featureEmoji}>🔥</Text>
            <Text style={s.featureLabel}>מעקב רצף</Text>
          </View>
          <View style={s.featureCard}>
            <Text style={s.featureEmoji}>📊</Text>
            <Text style={s.featureLabel}>תובנות יומיות</Text>
          </View>
          <View style={s.featureCard}>
            <Text style={s.featureEmoji}>⚡</Text>
            <Text style={s.featureLabel}>כפתור מגן</Text>
          </View>
        </View>
        <Text style={s.welcomeSubtext}>
          אלפי גברים כבר בנו שליטה עצמית אמיתית.{'\n'}הגיע תורך.
        </Text>
      </View>

      <ContinueButton onPress={onNext} enabled label="בואו נתחיל" />
      <Text style={s.welcomeDisclaimer}>שאלון קצר • 2 דקות • בלי שיפוטיות</Text>
    </Animated.View>
  )
}

// ─── Step 1: How long ──────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (v: string) => void }) {
  const [sel, setSel] = useState('')
  const opts = [
    { label: 'פחות מ-6 חודשים', emoji: '🌱' },
    { label: 'חצי שנה עד שנה', emoji: '🌿' },
    { label: '1-3 שנים', emoji: '🌲' },
    { label: 'יותר מ-3 שנים', emoji: '🏔️' },
  ]
  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>כמה זמן{'\n'}ההרגל הזה נמשך?</Text>
        <Text style={s.stepHint}>כנות עם עצמך היא הצעד הראשון</Text>
      </View>
      <View style={s.optionsGap}>
        {opts.map(o => (
          <OptionCard
            key={o.label}
            label={o.label}
            emoji={o.emoji}
            selected={sel === o.label}
            onPress={() => setSel(o.label)}
          />
        ))}
      </View>
      <ContinueButton onPress={() => onNext(sel)} enabled={!!sel} />
    </View>
  )
}

// ─── Step 2: Frequency ─────────────────────────────────────────────────────────
function Step2({ onNext }: { onNext: (v: string) => void }) {
  const [sel, setSel] = useState('')
  const opts = [
    { label: 'כל יום', sublabel: 'קורה לי מדי יום', emoji: '😔' },
    { label: 'כמה פעמים בשבוע', sublabel: '2-5 פעמים', emoji: '😕' },
    { label: 'פעם בשבוע', sublabel: 'בערך אחת לשבוע', emoji: '😐' },
    { label: 'לעיתים רחוקות', sublabel: 'לפעמים נופל', emoji: '🙂' },
  ]
  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>באיזו תדירות{'\n'}זה קורה?</Text>
        <Text style={s.stepHint}>בלי שיפוטיות — רק מידע</Text>
      </View>
      <View style={s.optionsGap}>
        {opts.map(o => (
          <OptionCard
            key={o.label}
            label={o.label}
            sublabel={o.sublabel}
            emoji={o.emoji}
            selected={sel === o.label}
            onPress={() => setSel(o.label)}
          />
        ))}
      </View>
      <ContinueButton onPress={() => onNext(sel)} enabled={!!sel} />
    </View>
  )
}

// ─── Step 3: Age ───────────────────────────────────────────────────────────────
function Step3({ onNext }: { onNext: (v: number) => void }) {
  const [age, setAge] = useState(22)
  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>בן כמה אתה?</Text>
        <Text style={s.stepHint}>נתאים את התוכן לגיל שלך</Text>
      </View>
      <View style={s.ageBox}>
        <Text style={s.ageBig}>{age}</Text>
        <Text style={s.ageUnit}>שנים</Text>
        <Slider
          style={s.slider}
          minimumValue={14}
          maximumValue={70}
          step={1}
          value={age}
          onValueChange={v => setAge(Math.round(v))}
          minimumTrackTintColor={C.orange}
          maximumTrackTintColor={C.border}
          thumbTintColor={C.orange}
        />
        <View style={s.sliderLabels}>
          <Text style={s.sliderLabel}>70</Text>
          <Text style={s.sliderLabel}>14</Text>
        </View>
      </View>
      <ContinueButton onPress={() => onNext(age)} enabled />
    </View>
  )
}

// ─── Step 4: Main goal ─────────────────────────────────────────────────────────
function Step4({ onNext }: { onNext: (v: string) => void }) {
  const [sel, setSel] = useState('')
  const opts = [
    { label: 'שיפור עצמי', sublabel: 'דיסציפלינה, אנרגיה, מיקוד', emoji: '🧠' },
    { label: 'מערכות יחסים', sublabel: 'לשפר את הקשר עם בת הזוג', emoji: '❤️' },
    { label: 'סיבות דתיות', sublabel: 'שמירת הברית, קדושה', emoji: '✡️' },
    { label: 'כולם יחד', sublabel: 'אני רוצה הכל', emoji: '⚡' },
  ]
  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>מה מניע אותך{'\n'}לשנות?</Text>
        <Text style={s.stepHint}>זו המטרה שנחזיר אותך למסלול</Text>
      </View>
      <View style={s.optionsGap}>
        {opts.map(o => (
          <OptionCard
            key={o.label}
            label={o.label}
            sublabel={o.sublabel}
            emoji={o.emoji}
            selected={sel === o.label}
            onPress={() => setSel(o.label)}
          />
        ))}
      </View>
      <ContinueButton onPress={() => onNext(sel)} enabled={!!sel} />
    </View>
  )
}

// ─── Step 5: Your Why ──────────────────────────────────────────────────────────
function Step5({ onNext }: { onNext: (v: string) => void }) {
  const [text, setText] = useState('')
  const charMin = 5
  const ready = text.trim().length >= charMin

  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>ה"למה" שלך</Text>
        <Text style={s.stepHint}>
          כשהרצון חלש — ה"למה" מחזיר אותך.{'\n'}כתוב משפט אחד שיחזיר אותך למסלול.
        </Text>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="למשל: אני עושה את זה כדי להיות אבא טוב יותר..."
        placeholderTextColor={C.dim}
        multiline
        numberOfLines={5}
        style={s.textArea}
        textAlign="right"
        textAlignVertical="top"
      />
      {text.length > 0 && !ready && (
        <Text style={s.charHint}>המשך לכתוב...</Text>
      )}
      <ContinueButton onPress={() => onNext(text.trim())} enabled={ready} />
    </View>
  )
}

// ─── Step 6: Language style ───────────────────────────────────────────────────
function Step6({ onNext }: { onNext: (v: 'secular' | 'religious') => void }) {
  const [sel, setSel] = useState<'secular' | 'religious' | ''>('')

  return (
    <View style={s.stepWrap}>
      <View style={s.stepHeader}>
        <Text style={s.stepQ}>בחר את{'\n'}הסגנון שלך</Text>
        <Text style={s.stepHint}>נתאים את השפה לעולם שמדבר אליך</Text>
      </View>
      <View style={s.optionsGap}>
        <TouchableOpacity
          onPress={() => setSel('secular')}
          style={[s.styleCard, sel === 'secular' && s.styleCardSelected]}
          activeOpacity={0.75}
        >
          <Text style={s.styleEmoji}>🧘</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[s.styleTitle, sel === 'secular' && { color: C.orange }]}>חילוני / כללי</Text>
            <Text style={s.styleDesc}>שיפור עצמי, דופמין דיטוקס, משמעת עצמית</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSel('religious')}
          style={[s.styleCard, sel === 'religious' && s.styleCardSelected]}
          activeOpacity={0.75}
        >
          <Text style={s.styleEmoji}>✡️</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[s.styleTitle, sel === 'religious' && { color: C.orange }]}>דתי / מסורתי</Text>
            <Text style={s.styleDesc}>שמירת הברית, שמירת עיניים, קדושה</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ContinueButton onPress={() => onNext(sel as 'secular' | 'religious')} enabled={!!sel} label="סיים והתחל" />
    </View>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const { completeOnboarding } = useStore()

  const handleNext = (value?: string | number) => {
    if (step === 0) { setStep(1); return }

    const keys = ['habitDuration', 'frequency', 'age', 'mainGoal', 'yourWhy', 'languageStyle']
    const qIdx = step - 1
    const newAnswers = { ...answers, [keys[qIdx]]: value! }
    setAnswers(newAnswers)

    if (step < QUESTION_STEPS) {
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

  const qSteps = [Step1, Step2, Step3, Step4, Step5, Step6]

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.header}>
          {step > 0 ? (
            <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={s.logoText}>שליטה</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProgressDots current={step} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 ? (
            <WelcomeScreen onNext={handleNext} />
          ) : (
            React.createElement(qSteps[step - 1], { onNext: handleNext as any })
          )}
        </ScrollView>

        {step > 0 && (
          <Text style={s.stepCount}>שלב {step} מתוך {QUESTION_STEPS}</Text>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  logoText: { fontSize: 20, fontFamily: F.black, color: C.orange },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 22, color: C.muted },

  dotsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 6, marginBottom: 8 },
  dot: { height: 4, borderRadius: 99, flex: 1 },
  dotDone: { backgroundColor: C.orange },
  dotActive: { backgroundColor: C.orange },
  dotInactive: { backgroundColor: C.border },

  scrollContent: { padding: 24, paddingBottom: 32, flexGrow: 1 },
  stepCount: { textAlign: 'center', color: C.dim, fontSize: 12, fontFamily: F.regular, paddingBottom: 14 },

  // Welcome
  welcomeWrap: { flex: 1, justifyContent: 'space-between', paddingBottom: 8 },
  welcomeTop: { alignItems: 'center', paddingTop: 24 },
  welcomeEmoji: { fontSize: 72, marginBottom: 16 },
  welcomeTitle: { fontSize: 42, fontFamily: F.black, color: C.orange, textAlign: 'center' },
  welcomeTagline: { fontSize: 16, fontFamily: F.regular, color: C.muted, textAlign: 'center', marginTop: 8 },
  welcomeCards: { paddingVertical: 24 },
  featureRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  featureCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  featureEmoji: { fontSize: 28, marginBottom: 6 },
  featureLabel: { fontSize: 12, fontFamily: F.bold, color: C.text, textAlign: 'center' },
  welcomeSubtext: { fontSize: 14, fontFamily: F.regular, color: C.muted, textAlign: 'center', lineHeight: 22 },
  welcomeDisclaimer: { textAlign: 'center', color: C.dim, fontSize: 12, fontFamily: F.regular, marginTop: 12 },

  // Step wrapper
  stepWrap: { flex: 1 },
  stepHeader: { marginBottom: 28 },
  stepQ: { fontSize: 30, fontFamily: F.black, color: C.text, textAlign: 'right', lineHeight: 38 },
  stepHint: { fontSize: 14, fontFamily: F.regular, color: C.muted, textAlign: 'right', marginTop: 8, lineHeight: 20 },

  optionsGap: { gap: 10, marginBottom: 28 },

  // Option card
  optionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    padding: 18, borderRadius: 16, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card, gap: 12,
  },
  optionCardSelected: { borderColor: C.orange, backgroundColor: C.orangeDim },
  optionLabel: { fontSize: 16, fontFamily: F.bold, color: C.text, textAlign: 'right' },
  optionSublabel: { fontSize: 12, fontFamily: F.regular, color: C.muted, textAlign: 'right', marginTop: 2 },
  optionEmoji: { fontSize: 26 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleSelected: { borderColor: C.orange },
  checkInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.orange },

  // Age
  ageBox: { alignItems: 'center', paddingVertical: 20, marginBottom: 28 },
  ageBig: { fontSize: 90, fontFamily: F.black, color: C.orange, lineHeight: 96 },
  ageUnit: { fontSize: 16, fontFamily: F.regular, color: C.muted, marginBottom: 16 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 },
  sliderLabel: { fontSize: 12, color: C.dim, fontFamily: F.regular },

  // Text area
  textArea: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    padding: 16, color: C.text, fontSize: 16, fontFamily: F.regular, minHeight: 140, marginBottom: 10,
  },
  charHint: { color: C.dim, fontSize: 12, fontFamily: F.regular, textAlign: 'right', marginBottom: 16 },

  // Style cards
  styleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    padding: 20, borderRadius: 16, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card, gap: 14,
  },
  styleCardSelected: { borderColor: C.orange, backgroundColor: C.orangeDim },
  styleEmoji: { fontSize: 32 },
  styleTitle: { fontSize: 18, fontFamily: F.bold, color: C.text, textAlign: 'right', marginBottom: 4 },
  styleDesc: { fontSize: 13, fontFamily: F.regular, color: C.muted, textAlign: 'right' },

  // Continue
  continueBtn: { backgroundColor: C.orange, borderRadius: 16, padding: 18, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: C.border },
  continueBtnText: { fontSize: 17, fontFamily: F.bold, color: '#fff' },
})
