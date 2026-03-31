import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native'
import { useStore } from '@/lib/store'
import { C, F } from '@/lib/theme'

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? ''

const SYSTEM_PROMPT = `אתה מאמן אישי תומך לגבר ישראלי שמנסה להפסיק לצפות בפורנוגרפיה.
דבר בעברית בלבד. היה קצר, חם, ישיר.
אל תטיף מוסר. תמוך, תנחה, תעזור לעבד טריגרים.
אם המשתמש מדווח על דחף עכשיו — תן לו תרגיל נשימה מיידי.`

type Message = { role: 'user' | 'assistant'; content: string }

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current
  const dot2 = useRef(new Animated.Value(0.3)).current
  const dot3 = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start()
    animate(dot1, 0)
    animate(dot2, 200)
    animate(dot3, 400)
  }, [])

  return (
    <View style={s.typingBubble}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[s.typingDot, { opacity: dot }]} />
      ))}
    </View>
  )
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <View style={[s.bubbleRow, isUser ? s.bubbleRowUser : s.bubbleRowCoach]}>
      {!isUser && <Text style={s.coachAvatar}>🤖</Text>}
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleCoach]}>
        <Text style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextCoach]}>
          {message.content}
        </Text>
      </View>
    </View>
  )
}

export default function CoachTab() {
  const { userName, currentStreak } = useStore()

  const openingMessage: Message = {
    role: 'assistant',
    content: `שלום ${userName || 'גיבור'}, אני המאמן שלך. אני כאן 24/7.\nספר לי איך אתה מרגיש היום.`,
  }

  const [messages, setMessages] = useState<Message[]>([openingMessage])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    scrollToBottom()

    try {
      const history = next
        .filter(m => m !== openingMessage)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history,
          }),
        }
      )

      const data = await res.json()
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'מצטער, הייתה שגיאה. נסה שוב.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'לא הצלחתי להתחבר. בדוק את החיבור ונסה שוב.' }])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerSub}>
          {currentStreak > 0 ? `יום ${currentStreak} ברצף 🔥` : 'מוכן לעזור'}
        </Text>
        <Text style={s.headerTitle}>🤖  מאמן אישי</Text>
      </View>

      {/* TODO: remove this banner when API key is ready */}
      <View style={s.comingSoon}>
        <Text style={s.comingSoonIcon}>🤖</Text>
        <Text style={s.comingSoonTitle}>המאמן האישי מגיע בקרוב</Text>
        <Text style={s.comingSoonSub}>תכונה זו תהיה זמינה בגרסה הקרובה</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#ffffff08',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 18, fontFamily: F.black, color: C.text },
  headerSub:   { fontSize: 11, fontFamily: F.bold, color: C.dim, letterSpacing: 1, marginTop: 2 },

  messageList:    { flex: 1 },
  messageContent: { padding: 16, gap: 12, paddingBottom: 8 },

  bubbleRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowUser:  { justifyContent: 'flex-end' },
  bubbleRowCoach: { justifyContent: 'flex-start' },

  coachAvatar: { fontSize: 22, marginBottom: 2 },

  bubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12,
  },
  bubbleUser:  {
    backgroundColor: '#FF6B2C',
    borderBottomRightRadius: 4,
  },
  bubbleCoach: {
    backgroundColor: '#1e1e1e',
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  bubbleText:      { fontSize: 15, lineHeight: 22, fontFamily: F.regular },
  bubbleTextUser:  { color: '#ffffff' },
  bubbleTextCoach: { color: C.text },

  typingBubble: {
    flexDirection: 'row', gap: 5,
    backgroundColor: '#1e1e1e', borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  typingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.muted,
  },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#ffffff08',
    backgroundColor: C.bg,
  },
  input: {
    flex: 1, backgroundColor: '#1a1a1a',
    borderRadius: 22, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 16, paddingVertical: 12,
    color: C.text, fontSize: 15, fontFamily: F.regular,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FF6B2C',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#2a2a2a' },
  sendIcon: { fontSize: 20, color: '#fff', fontFamily: F.black, marginTop: -2 },

  comingSoon: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingHorizontal: 40,
  },
  comingSoonIcon:  { fontSize: 52 },
  comingSoonTitle: { fontSize: 18, fontFamily: F.black, color: C.text, textAlign: 'center' },
  comingSoonSub:   { fontSize: 14, fontFamily: F.regular, color: C.dim, textAlign: 'center', lineHeight: 22 },
})
