import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import { useStore } from '@/lib/store'
import { C, F } from '@/lib/theme'

type Plan = 'yearly' | 'monthly'

export default function PaywallScreen() {
  const { setPro } = useStore()
  const [selected, setSelected] = useState<Plan>('yearly')

  const handleSubscribe = () => {
    // TODO: connect to RevenueCat
    setPro(true)
    router.replace('/(tabs)')
  }

  const handleFree = () => {
    setPro(false)
    router.replace('/(tabs)')
  }

  const btnLabel =
    selected === 'yearly'
      ? 'התחל 3 ימי ניסיון — ואז 100₪ לשנה'
      : 'התחל 3 ימי ניסיון — ואז 5$ לחודש'

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.crown}>👑</Text>
        <Text style={s.title}>אתה מוכן להשתנות</Text>
        <Text style={s.subtitle}>בחר את התוכנית שלך</Text>
      </View>

      {/* Plans */}
      <View style={s.plansRow}>

        {/* Yearly — recommended */}
        <TouchableOpacity
          onPress={() => setSelected('yearly')}
          style={[s.planCard, selected === 'yearly' && s.planCardSelected]}
          activeOpacity={0.85}
        >
          <View style={s.badge}>
            <Text style={s.badgeText}>הכי פופולרי 🔥</Text>
          </View>
          <Text style={s.planPrice}>100₪</Text>
          <Text style={s.planPer}>לשנה</Text>
          <Text style={s.planSub}>פחות מ-9₪ לחודש</Text>
          <View style={s.trialTag}>
            <Text style={s.trialText}>3 ימי ניסיון חינם</Text>
          </View>
        </TouchableOpacity>

        {/* Monthly */}
        <TouchableOpacity
          onPress={() => setSelected('monthly')}
          style={[s.planCard, selected === 'monthly' && s.planCardSelectedGray]}
          activeOpacity={0.85}
        >
          <View style={s.badgePlaceholder} />
          <Text style={s.planPrice}>5$</Text>
          <Text style={s.planPer}>לחודש</Text>
          <Text style={s.planSub}>ביטול בכל עת</Text>
          <View style={s.trialTag}>
            <Text style={s.trialText}>3 ימי ניסיון חינם</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* CTA */}
      <View style={s.footer}>
        <TouchableOpacity onPress={handleSubscribe} style={s.ctaBtn} activeOpacity={0.88}>
          <Text style={s.ctaText}>{btnLabel}</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          לא נחייב אותך עד סוף הניסיון. ביטול בכל עת.
        </Text>

        <TouchableOpacity onPress={handleFree} activeOpacity={0.7}>
          <Text style={s.freeBtn}>המשך בחינם (פונקציות מוגבלות)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },

  header: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24, gap: 10 },
  crown:    { fontSize: 56 },
  title:    { fontSize: 28, fontFamily: F.black, color: C.text, textAlign: 'center' },
  subtitle: { fontSize: 16, fontFamily: F.regular, color: C.muted, textAlign: 'center' },

  plansRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20,
  },
  planCard: {
    flex: 1, backgroundColor: '#111',
    borderRadius: 18, borderWidth: 1.5, borderColor: '#2a2a2a',
    padding: 18, alignItems: 'center', gap: 6,
    minHeight: 200,
  },
  planCardSelected: {
    borderColor: '#FF6B2C',
    backgroundColor: 'rgba(255,107,44,0.07)',
  },
  planCardSelectedGray: {
    borderColor: '#555',
    backgroundColor: '#181818',
  },

  badge: {
    backgroundColor: '#FF6B2C',
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 4,
  },
  badgeText:    { fontSize: 11, fontFamily: F.bold, color: '#fff' },
  badgePlaceholder: { height: 24 },

  planPrice: { fontSize: 32, fontFamily: F.black, color: C.text },
  planPer:   { fontSize: 13, fontFamily: F.regular, color: C.dim, marginTop: -4 },
  planSub:   { fontSize: 11, fontFamily: F.regular, color: C.dim, textAlign: 'center' },

  trialTag: {
    marginTop: 8,
    backgroundColor: '#1e1e1e', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  trialText: { fontSize: 11, fontFamily: F.bold, color: C.muted },

  footer: { paddingHorizontal: 20, paddingBottom: 32, gap: 14, alignItems: 'center' },

  ctaBtn: {
    width: '100%', backgroundColor: C.green,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { fontSize: 16, fontFamily: F.black, color: '#fff', textAlign: 'center' },

  disclaimer: {
    fontSize: 12, fontFamily: F.regular, color: C.dim, textAlign: 'center',
  },
  freeBtn: {
    fontSize: 13, fontFamily: F.regular, color: C.dim,
    textDecorationLine: 'underline', textAlign: 'center',
  },
})
