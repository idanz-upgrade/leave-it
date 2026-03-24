import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal, TextInput, Alert } from 'react-native'
import { useStore, LEVEL_REQUIREMENTS } from '@/lib/store'
import { C, F } from '@/lib/theme'

const MILESTONES = [
  { label: '7 ימים',       key: 7,   emoji: '🌱' },
  { label: '30 ימים',      key: 30,  emoji: '🌿' },
  { label: '90 ימים',      key: 90,  emoji: '🌳' },
  { label: '100 משימות',   key: 100, emoji: '⚡', taskBased: true },
]

function EditWhyModal({ current, onSave, onClose }: { current: string; onSave: (v: string) => void; onClose: () => void }) {
  const [text, setText] = useState(current)
  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <View style={s.sheetHeader}>
            <TouchableOpacity onPress={onClose}><Text style={{ color: C.dim, fontSize: 20 }}>✕</Text></TouchableOpacity>
            <Text style={s.sheetTitle}>ההתחייבות שלי</Text>
          </View>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="למשל: אני עושה את זה בשביל המשפחה שלי..."
            placeholderTextColor={C.dim}
            multiline numberOfLines={4}
            style={s.textArea}
            textAlign="right"
            textAlignVertical="top"
          />
          <TouchableOpacity onPress={() => { onSave(text); onClose() }} style={s.saveBtn} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>שמור</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default function ProfileTab() {
  const { onboardingData, currentStreak, longestStreak, xp, level, tasks, setbacks, checkins } = useStore()
  const [editingWhy, setEditingWhy] = useState(false)
  const [why, setWhy] = useState(onboardingData?.yourWhy || '')

  const req = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const tasksCompleted = tasks.filter(t => t.isCompleted).length

  const getMilestoneProgress = (m: typeof MILESTONES[0]) => {
    if (m.taskBased) return { current: tasksCompleted, target: m.key }
    return { current: currentStreak, target: m.key }
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.screenTitle}>פרופיל</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar + level */}
        <View style={s.profileCard}>
          <View style={s.profileGlow} />
          <View style={s.avatar}>
            <Text style={{ fontSize: 40 }}>{req.emoji}</Text>
          </View>
          <Text style={s.userName}>לוחם</Text>
          <View style={s.levelBadge}>
            <Text style={s.levelBadgeText}>רמה {level} — {req.name}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>🔥 {currentStreak}</Text>
            <Text style={s.statLabel}>Streak נוכחי</Text>
          </View>
          <View style={[s.statBox, { borderColor: C.orange }]}>
            <Text style={s.statValue}>⚡ {xp.toLocaleString()}</Text>
            <Text style={s.statLabel}>XP</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>🏆 {longestStreak}</Text>
            <Text style={s.statLabel}>שיא אישי</Text>
          </View>
        </View>

        {/* Your Why */}
        <View style={s.whyCard}>
          <View style={s.whyHeader}>
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.editLink}>✏️ ערוך</Text>
            </TouchableOpacity>
            <Text style={s.whyTitle}>ההתחייבות שלי</Text>
          </View>
          {why ? (
            <Text style={s.whyText}>{why}</Text>
          ) : (
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.whyEmpty}>+ הוסף את הסיבה שלך לעצירה</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Milestones */}
        <View style={s.card}>
          <Text style={s.cardTitle}>הישגים</Text>
          <View style={s.milestonesGrid}>
            {MILESTONES.map(m => {
              const { current, target } = getMilestoneProgress(m)
              const done = current >= target
              return (
                <View key={m.label} style={[s.milestoneBox, done && s.milestoneBoxDone]}>
                  <Text style={{ fontSize: 28, opacity: done ? 1 : 0.3 }}>{m.emoji}</Text>
                  <Text style={[s.milestoneName, done && { color: C.green }]}>{m.label}</Text>
                  <Text style={s.milestoneProg}>{Math.min(current, target)}/{target}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Language style */}
        <View style={s.card}>
          <View style={s.infoRow}>
            <Text style={s.infoValue}>{onboardingData?.languageStyle === 'religious' ? '✡️ דתי / מסורתי' : '🧘 חילוני'}</Text>
            <Text style={s.infoLabel}>סגנון שפה</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoValue}>{setbacks.length}</Text>
            <Text style={s.infoLabel}>נפילות מתועדות</Text>
          </View>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={s.infoValue}>{checkins.length}</Text>
            <Text style={s.infoLabel}>צ'ק-אינים</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={[s.card, { borderColor: 'rgba(239,68,68,0.2)' }]}>
          <Text style={[s.cardTitle, { color: C.red }]}>אזור מסוכן</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('אתחול', 'פעולה זו תמחק את כל ההתקדמות שלך. האם אתה בטוח?', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'אפס הכל', style: 'destructive', onPress: () => {} },
            ])}
            style={s.dangerBtn}
            activeOpacity={0.8}
          >
            <Text style={s.dangerBtnText}>איפוס כל ההתקדמות</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {editingWhy && (
        <EditWhyModal current={why} onSave={setWhy} onClose={() => setEditingWhy(false)} />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right' },
  scrollContent: { paddingHorizontal: 16, gap: 12 },

  profileCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 28, alignItems: 'center', overflow: 'hidden', gap: 10 },
  profileGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: C.orangeDim },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#222', borderWidth: 2, borderColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 22, fontFamily: F.black, color: C.text },
  levelBadge: { backgroundColor: C.orangeDim, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderColor: C.orange },
  levelBadgeText: { fontSize: 13, fontFamily: F.bold, color: C.orange },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontFamily: F.bold, color: C.text },
  statLabel: { fontSize: 10, color: C.dim, fontFamily: F.regular },

  whyCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  whyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  whyTitle: { fontSize: 15, fontFamily: F.bold, color: C.text },
  editLink: { fontSize: 13, color: C.orange, fontFamily: F.regular },
  whyText: { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'right', lineHeight: 22 },
  whyEmpty: { fontSize: 14, color: C.dim, textAlign: 'right', fontFamily: F.regular },

  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  cardTitle: { fontSize: 13, fontFamily: F.bold, color: C.muted, letterSpacing: 1, textAlign: 'right', marginBottom: 14 },

  milestonesGrid: { flexDirection: 'row', gap: 10 },
  milestoneBox: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center', gap: 4 },
  milestoneBoxDone: { borderColor: C.green, backgroundColor: 'rgba(34,197,94,0.08)' },
  milestoneName: { fontSize: 11, fontFamily: F.bold, color: C.dim, textAlign: 'center' },
  milestoneProg: { fontSize: 10, color: '#333', fontFamily: F.regular },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  infoLabel: { fontSize: 14, color: C.muted, fontFamily: F.regular },
  infoValue: { fontSize: 14, fontFamily: F.bold, color: C.text },

  dangerBtn: { borderWidth: 1, borderColor: C.red, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  dangerBtnText: { color: C.red, fontSize: 14, fontFamily: F.bold },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontFamily: F.bold, color: C.text },
  textArea: { backgroundColor: '#111', borderWidth: 1.5, borderColor: '#333', borderRadius: 12, padding: 16, color: C.text, fontSize: 15, fontFamily: F.regular, minHeight: 120, marginBottom: 16 },
  saveBtn: { backgroundColor: C.orange, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: F.bold },
})
