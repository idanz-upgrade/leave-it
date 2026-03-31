import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useStore } from '@/lib/store'
import { C, F } from '@/lib/theme'
import {
  fetchTop10, fetchMyRank, getOrCreateAnonymousId,
  LeaderboardEntry,
} from '@/lib/leaderboard'

const MILESTONE_TARGETS = [
  { days: 7,   label: '7 ימים',   emoji: '🌱' },
  { days: 30,  label: '30 ימים',  emoji: '🌿' },
  { days: 90,  label: '90 ימים',  emoji: '🌳' },
  { days: 365, label: '365 ימים', emoji: '🏆' },
]

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function CommunityTab() {
  const { currentStreak, totalCleanDays } = useStore()

  const [entries, setEntries]       = useState<LeaderboardEntry[]>([])
  const [myAnonId, setMyAnonId]     = useState<string>('')
  const [myRank, setMyRank]         = useState<number>(0)
  const [loading, setLoading]       = useState(true)
  const [fromCache, setFromCache]   = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false

      async function load() {
        setLoading(true)
        const [top10, anonId] = await Promise.all([
          fetchTop10(),
          getOrCreateAnonymousId(),
        ])
        if (cancelled) return

        const isInTop10 = top10.some(e => e.anonymous_id === anonId)
        const rank = isInTop10
          ? (top10.findIndex(e => e.anonymous_id === anonId) + 1)
          : await fetchMyRank(anonId, currentStreak)

        // detect cache: if every entry has the same data as before network attempt failed
        // we mark it (fetchTop10 returns cached silently)
        setEntries(top10)
        setMyAnonId(anonId)
        setMyRank(rank)
        setFromCache(top10.length > 0 && !isInTop10 && rank === 0)
        setLoading(false)
      }

      load()
      return () => { cancelled = true }
    }, [currentStreak])
  )

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>קהילה</Text>
        {fromCache && <Text style={s.cacheNote}>• נתונים מקובץ מטמון</Text>}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* My position card */}
        <View style={s.myRankCard}>
          <View style={s.myRankGlow} />
          <Text style={s.myRankLabel}>המיקום שלי</Text>
          {loading ? (
            <ActivityIndicator color={C.orange} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <Text style={s.myRankNumber}>
                {myRank > 0 ? `#${myRank}` : '—'}
              </Text>
            </>
          )}
          <View style={s.myStreakRow}>
            <Text style={s.myStreakLabel}>🔥 Streak: {currentStreak} ימים</Text>
          </View>
        </View>

        {/* Milestone progress */}
        <View style={s.card}>
          <Text style={s.cardTitle}>יעדי ה-STREAK שלי</Text>
          {MILESTONE_TARGETS.map(m => {
            const pct = Math.min(1, currentStreak / m.days)
            return (
              <View key={m.days} style={s.milestoneRow}>
                <View style={s.milestoneProgress}>
                  <View style={[s.milestoneFill, { width: `${pct * 100}%` as any }]} />
                </View>
                <View style={s.milestoneRight}>
                  <Text style={s.milestoneEmoji}>{m.emoji}</Text>
                  <Text style={s.milestoneLabel}>{m.label}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Leaderboard */}
        <View style={s.card}>
          <Text style={s.cardTitle}>לוח מובילים — TOP 10</Text>

          {loading ? (
            <ActivityIndicator color={C.orange} style={{ marginVertical: 20 }} />
          ) : entries.length === 0 ? (
            <Text style={s.emptyText}>אין נתונים עדיין — היה הראשון!</Text>
          ) : (
            entries.map((entry, idx) => {
              const rank      = idx + 1
              const isMe      = entry.anonymous_id === myAnonId
              const medal     = RANK_MEDALS[rank]
              return (
                <View
                  key={entry.anonymous_id}
                  style={[s.leaderRow, isMe && s.leaderRowMe, idx === entries.length - 1 && s.leaderRowLast]}
                >
                  {/* Rank */}
                  <View style={[s.rankBadge, rank <= 3 && s.rankBadgeTop, isMe && s.rankBadgeMe]}>
                    {medal
                      ? <Text style={s.medalText}>{medal}</Text>
                      : <Text style={[s.rankText, isMe && s.rankTextMe]}>#{rank}</Text>
                    }
                  </View>

                  {/* Name */}
                  <Text style={[s.leaderName, isMe && s.leaderNameMe]}>
                    {entry.display_name}{isMe ? ' (אני)' : ''}
                  </Text>

                  {/* Streak */}
                  <Text style={[s.leaderStreak, isMe && s.leaderStreakMe]}>
                    🔥 {entry.streak}
                  </Text>
                </View>
              )
            })
          )}
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
  topBar: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text },
  cacheNote: { fontSize: 11, color: C.dim, fontFamily: F.regular },
  scrollContent: { paddingHorizontal: 16, gap: 12 },

  myRankCard: {
    backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border,
    padding: 28, alignItems: 'center', overflow: 'hidden',
  },
  myRankGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: C.orangeDim },
  myRankLabel: { fontSize: 12, color: C.muted, fontFamily: F.bold, letterSpacing: 1, marginBottom: 8 },
  myRankNumber: { fontSize: 56, fontFamily: F.black, color: C.orange },
  myStreakRow: { marginTop: 12, backgroundColor: '#111', borderRadius: 99, paddingVertical: 8, paddingHorizontal: 16 },
  myStreakLabel: { fontSize: 14, color: C.text, fontFamily: F.bold },

  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  cardTitle: { fontSize: 13, fontFamily: F.bold, color: C.muted, letterSpacing: 1, textAlign: 'right', marginBottom: 14 },

  milestoneRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  milestoneRight: { alignItems: 'center', width: 44 },
  milestoneEmoji: { fontSize: 20, textAlign: 'center' },
  milestoneLabel: { fontSize: 11, color: C.dim, fontFamily: F.regular, textAlign: 'center' },
  milestoneProgress: { flex: 1, height: 8, backgroundColor: '#111', borderRadius: 99, overflow: 'hidden', marginLeft: 12 },
  milestoneFill: { height: '100%', backgroundColor: C.orange, borderRadius: 99 },

  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222',
  },
  leaderRowLast: { borderBottomWidth: 0 },
  leaderRowMe: { backgroundColor: C.orangeDim, marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 10 },

  rankBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#222', alignItems: 'center', justifyContent: 'center',
  },
  rankBadgeTop: { backgroundColor: C.orangeDim, borderWidth: 1, borderColor: C.orange },
  rankBadgeMe: { borderWidth: 1.5, borderColor: C.orange },
  rankText: { fontSize: 11, fontFamily: F.bold, color: C.muted },
  rankTextMe: { color: C.orange },
  medalText: { fontSize: 16 },

  leaderName: { flex: 1, fontSize: 15, fontFamily: F.regular, color: C.text, textAlign: 'right', marginHorizontal: 10 },
  leaderNameMe: { fontFamily: F.bold, color: C.orange },
  leaderStreak: { fontSize: 13, fontFamily: F.bold, color: C.dim },
  leaderStreakMe: { color: C.orange },

  emptyText: { fontSize: 14, color: C.dim, fontFamily: F.regular, textAlign: 'center', paddingVertical: 20 },

  comingSoonCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: 'center', gap: 8 },
  comingSoonEmoji: { fontSize: 36 },
  comingSoonTitle: { fontSize: 17, fontFamily: F.bold, color: C.text },
  comingSoonSub: { fontSize: 13, color: C.muted, fontFamily: F.regular, textAlign: 'center' },
})
