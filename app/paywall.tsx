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

  const btnLabel =
    selected === 'yearly'
      ? 'התחל 3 ימי ניסיון חינם →'
      : 'התחל עכשיו ב-19.9₪ →'

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>התחל את המסע שלך</Text>
        <Text style={s.subtitle}>אלפי גברים כבר בחרו להשתנות</Text>
      </View>

      {/* Plans */}
      <View style={s.plansRow}>

        {/* Monthly */}
        <TouchableOpacity
          onPress={() => setSelected('monthly')}
          style={[s.planCard, selected === 'monthly' && s.planCardGray]}
          activeOpacity={0.85}
        >
          <View style={s.badgePlaceholder} />
          <Text style={s.planPrice}>19.9₪</Text>
          <Text style={s.planPer}>לחודש</Text>
          <Text style={s.planSub}>ביטול בכל עת</Text>
        </TouchableOpacity>

        {/* Yearly — recommended (default) */}
        <TouchableOpacity
          onPress={() => setSelected('yearly')}
          style={[s.planCard, s.planCardOrange, selected === 'yearly' && s.planCardOrangeSel]}
          activeOpacity={0.85}
        >
          <View style={s.badge}>
            <Text style={s.badgeText}>הכי פופולרי 🔥</Text>
          </View>
          <Text style={s.planPrice}>99₪</Text>
          <Text style={s.planPer}>לשנה</Text>
          <Text style={s.planSubGreen}>3 ימי ניסיון חינם</Text>
          <Text style={s.planSub}>פחות מ-8.5₪ לחודש</Text>
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
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },

  header: { alignItems: 'center', paddingTop: 52, paddingHorizontal: 24, gap: 10 },
  title:    { fontSize: 30, fontFamily: F.black, color: C.text, textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'center' },

  plansRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20,
  },

  planCard: {
    flex: 1, backgroundColor: '#111',
    borderRadius: 20, borderWidth: 1.5, borderColor: '#2a2a2a',
    padding: 20, alignItems: 'center', gap: 6, minHeight: 190,
  },
  planCardGray: {
    borderColor: '#444',
    backgroundColor: '#181818',
  },
  planCardOrange: {
    borderColor: C.orange,
    backgroundColor: 'rgba(255,107,44,0.07)',
  },
  planCardOrangeSel: {
    backgroundColor: 'rgba(255,107,44,0.12)',
  },

  badge: {
    backgroundColor: C.orange,
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5,
    marginBottom: 4,
  },
  badgeText:        { fontSize: 11, fontFamily: F.bold, color: '#fff' },
  badgePlaceholder: { height: 28 },

  planPrice: { fontSize: 34, fontFamily: F.black, color: C.text },
  planPer:   { fontSize: 13, fontFamily: F.regular, color: C.dim, marginTop: -4 },
  planSub:   { fontSize: 11, fontFamily: F.regular, color: C.dim, textAlign: 'center' },
  planSubGreen: { fontSize: 12, fontFamily: F.bold, color: C.green, textAlign: 'center' },

  footer: { paddingHorizontal: 20, paddingBottom: 36, gap: 14, alignItems: 'center' },

  ctaBtn: {
    width: '100%', backgroundColor: C.green,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: F.black, color: '#fff', textAlign: 'center' },

  disclaimer: {
    fontSize: 12, fontFamily: F.regular, color: C.dim, textAlign: 'center',
  },
})
