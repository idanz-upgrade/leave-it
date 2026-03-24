import React from 'react'
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import { useStore } from '@/lib/store'
import { C, F } from '@/lib/theme'

const MILESTONE_TARGETS = [
  { days: 7,   label: '7 ימים',   emoji: '🌱' },
  { days: 30,  label: '30 ימים',  emoji: '🌿' },
  { days: 90,  label: '90 ימים',  emoji: '🌳' },
  { days: 365, label: '365 ימים', emoji: '🏆' },
]

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'א.ל.',   streak: 142 },
  { rank: 2, name: 'מ.כ.',   streak: 98  },
  { rank: 3, name: 'ד.ש.',   streak: 87  },
  { rank: 4, name: 'י.ג.',   streak: 65  },
  { rank: 5, name: 'ר.מ.',   streak: 54  },
]

export default function CommunityTab() {
  const { currentStreak } = useStore()
  const userRank = 247

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>קהילה</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* My position */}
        <View style={s.myRankCard}>
          <View style={s.myRankGlow} />
          <Text style={s.myRankLabel}>המיקום שלי</Text>
          <Text style={s.myRankNumber}>#{userRank}</Text>
          <Text style={s.myRankSub}>מתוך 1,237 לוחמים</Text>
          <View style={s.myStreakRow}>
            <Text style={s.myStreakLabel}>🔥 Streak: {currentStreak} ימים</Text>
          </View>
        </View>

        {/* Top streaks */}
        <View style={s.card}>
          <Text style={s.cardTitle}>TOP STREAKS</Text>
          {MILESTONE_TARGETS.map(m => {
            const pct = Math.min(1, currentStreak / m.days)
            return (
              <View key={m.days} style={s.milestoneRow}>
                <View style={s.milestoneProgress}>
                  <View style={[s.milestoneFill, { width: `${pct * 100}%` }]} />
                </View>
                <View>
                  <Text style={s.milestoneEmoji}>{m.emoji}</Text>
                  <Text style={s.milestoneLabel}>{m.label}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Leaderboard */}
        <View style={s.card}>
          <Text style={s.cardTitle}>לוח מובילים</Text>
          {MOCK_LEADERBOARD.map(entry => (
            <View key={entry.rank} style={s.leaderRow}>
              <Text style={s.leaderStreak}>🔥 {entry.streak}</Text>
              <Text style={s.leaderName}>{entry.name}</Text>
              <View style={[s.leaderRankBadge, entry.rank <= 3 && s.leaderRankTop]}>
                <Text style={s.leaderRankText}>#{entry.rank}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.comingSoonCard}>
          <Text style={s.comingSoonEmoji}>🚀</Text>
          <Text style={s.comingSoonTitle}>פיצ'רים נוספים בקרוב</Text>
          <Text style={s.comingSoonSub}>פורום קהילתי, חברים, תמיכה קבוצתית</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right' },
  scrollContent: { paddingHorizontal: 16, gap: 12 },

  myRankCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: 'center', overflow: 'hidden' },
  myRankGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: C.orangeDim },
  myRankLabel: { fontSize: 12, color: C.muted, fontFamily: F.bold, letterSpacing: 1, marginBottom: 8 },
  myRankNumber: { fontSize: 56, fontFamily: F.black, color: C.orange },
  myRankSub: { fontSize: 14, color: C.muted, fontFamily: F.regular, marginTop: 4 },
  myStreakRow: { marginTop: 12, backgroundColor: '#111', borderRadius: 99, paddingVertical: 8, paddingHorizontal: 16 },
  myStreakLabel: { fontSize: 14, color: C.text, fontFamily: F.bold },

  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  cardTitle: { fontSize: 13, fontFamily: F.bold, color: C.muted, letterSpacing: 1, textAlign: 'right', marginBottom: 14 },

  milestoneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  milestoneEmoji: { fontSize: 20, textAlign: 'center' },
  milestoneLabel: { fontSize: 11, color: C.dim, fontFamily: F.regular, textAlign: 'center' },
  milestoneProgress: { flex: 1, height: 8, backgroundColor: '#111', borderRadius: 99, overflow: 'hidden', marginHorizontal: 12 },
  milestoneFill: { height: '100%', backgroundColor: C.orange, borderRadius: 99 },

  leaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  leaderRankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  leaderRankTop: { backgroundColor: C.orangeDim, borderWidth: 1, borderColor: C.orange },
  leaderRankText: { fontSize: 11, fontFamily: F.bold, color: C.muted },
  leaderName: { flex: 1, fontSize: 15, fontFamily: F.regular, color: C.text, textAlign: 'right', marginHorizontal: 8 },
  leaderStreak: { fontSize: 13, fontFamily: F.bold, color: C.orange },

  comingSoonCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: 'center', gap: 8 },
  comingSoonEmoji: { fontSize: 36 },
  comingSoonTitle: { fontSize: 17, fontFamily: F.bold, color: C.text },
  comingSoonSub: { fontSize: 13, color: C.muted, fontFamily: F.regular, textAlign: 'center' },
})
