import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Modal, TextInput, Alert, Image, ImageSourcePropType,
} from 'react-native'
import { useStore, LEVEL_REQUIREMENTS, Sport } from '@/lib/store'
import { C, F } from '@/lib/theme'

const SPORT_IMAGES: Record<Sport, Partial<Record<number, ImageSourcePropType>>> = {
  football:   { 1: require('../assets/avatar/level01.png') },
  basketball: {},
  tennis:     {},
  running:    {},
}

const MILESTONES = [
  { label: '7 ימים',     key: 7,   taskBased: false },
  { label: '30 ימים',    key: 30,  taskBased: false },
  { label: '90 ימים',    key: 90,  taskBased: false },
  { label: '100 משימות', key: 100, taskBased: true  },
]

function EditWhyModal({ current, onSave, onClose }: { current: string; onSave: (v: string) => void; onClose: () => void }) {
  const [text, setText] = useState(current)
  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>ההתחייבות שלי</Text>
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

  const req          = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const nextReq      = LEVEL_REQUIREMENTS[Math.min(level, 9)]
  const aura         = req.aura ?? C.orange
  const sport        = onboardingData?.sport ?? null
  const image        = SPORT_IMAGES[sport ?? 'football']?.[level]
  const tasksCompleted = tasks.filter(t => t.isCompleted).length

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>פרופיל שחקן</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Player card hero */}
        <View style={s.playerCard}>
          <View style={[s.cardGlow, { backgroundColor: aura + '18' }]} />

          {/* Level tag */}
          <View style={[s.lvlTag, { borderColor: aura + '70' }]}>
            <Text style={[s.lvlTagText, { color: aura }]}>רמה {String(level).padStart(2, '0')}</Text>
          </View>

          {/* Character */}
          {image ? (
            <Image source={image} style={s.charImage} resizeMode="contain" />
          ) : (
            <Text style={s.charEmoji}>{req.emoji}</Text>
          )}

          <Text style={s.charName}>{req.name}</Text>
          <Text style={s.charNameEn}>{req.nameEn.toUpperCase()}</Text>
        </View>

        {/* Stats HUD */}
        <View style={s.statsHUD}>
          <View style={s.statCol}>
            <Text style={s.statValue}>{currentStreak}</Text>
            <Text style={s.statLabel}>ימים ברצף</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCol}>
            <Text style={[s.statValue, { color: C.orange }]}>{xp.toLocaleString()}</Text>
            <Text style={s.statLabel}>ניקוד</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCol}>
            <Text style={s.statValue}>{longestStreak}</Text>
            <Text style={s.statLabel}>שיא אישי</Text>
          </View>
        </View>

        {/* Next level */}
        {level < 10 && (
          <View style={s.block}>
            <Text style={s.blockLabel}>הרמה הבאה</Text>
            <View style={s.nextLevelRow}>
              <Text style={[s.nextLevelName, { color: aura }]}>{nextReq.name} ←</Text>
              <View style={s.nextLevelStats}>
                <View style={s.nextStat}>
                  <Text style={s.nextStatVal}>{nextReq.streak}</Text>
                  <Text style={s.nextStatLabel}>ימי רצף</Text>
                </View>
                <View style={s.nextStat}>
                  <Text style={[s.nextStatVal, { color: C.orange }]}>{nextReq.xp.toLocaleString()}</Text>
                  <Text style={s.nextStatLabel}>ניקוד</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Why */}
        <View style={s.block}>
          <View style={s.blockHeaderRow}>
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.editBtn}>ערוך</Text>
            </TouchableOpacity>
            <Text style={s.blockLabel}>ההתחייבות שלי</Text>
          </View>
          {why ? (
            <Text style={s.whyText}>{why}</Text>
          ) : (
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.whyEmpty}>+ הוסף את הסיבה שלך</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Milestones */}
        <View style={s.block}>
          <Text style={s.blockLabel}>הישגים</Text>
          <View style={s.milestonesRow}>
            {MILESTONES.map(m => {
              const current = m.taskBased ? tasksCompleted : currentStreak
              const done = current >= m.key
              return (
                <View key={m.label} style={[s.milestone, done && s.milestoneDone]}>
                  <Text style={[s.milestoneVal, done && { color: C.green }]}>
                    {Math.min(current, m.key)}/{m.key}
                  </Text>
                  <Text style={[s.milestoneLabel, done && { color: C.green }]}>{m.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={s.block}>
          <Text style={s.blockLabel}>סטטיסטיקות</Text>
          <View style={s.infoRow}>
            <Text style={s.infoVal}>{setbacks.length}</Text>
            <Text style={s.infoKey}>נפילות מתועדות</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoVal}>{checkins.length}</Text>
            <Text style={s.infoKey}>צ׳ק-אינים</Text>
          </View>
          <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={s.infoVal}>{onboardingData?.languageStyle === 'religious' ? 'דתי / מסורתי' : 'חילוני'}</Text>
            <Text style={s.infoKey}>סגנון שפה</Text>
          </View>
        </View>

        {/* Danger */}
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

        <View style={{ height: 40 }} />
      </ScrollView>

      {editingWhy && (
        <EditWhyModal current={why} onSave={setWhy} onClose={() => setEditingWhy(false)} />
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { paddingBottom: 20 },

  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  headerTitle: { fontSize: 11, fontFamily: F.black, color: C.dim, letterSpacing: 2.5, textAlign: 'right' },

  // Player card
  playerCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff06',
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  lvlTag: {
    borderWidth: 1, borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#ffffff06',
    marginBottom: 12,
  },
  lvlTagText:  { fontSize: 10, fontFamily: F.black, letterSpacing: 1.5 },
  charImage:   { width: 180, height: 200 },
  charEmoji:   { fontSize: 90 },
  charName:    { fontSize: 22, fontFamily: F.black, color: C.text, marginTop: 8 },
  charNameEn:  { fontSize: 9, color: C.dim, fontFamily: F.black, letterSpacing: 3, marginTop: 4 },

  // Stats HUD
  statsHUD: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#ffffff06',
  },
  statCol:     { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 20, fontFamily: F.black, color: C.text },
  statLabel:   { fontSize: 9, fontFamily: F.bold, color: C.dim, letterSpacing: 1.5, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#1e1e1e' },

  // Blocks
  block: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff06',
    padding: 16,
  },
  blockLabel:    { fontSize: 9, fontFamily: F.black, color: C.dim, letterSpacing: 2.5, textAlign: 'right', marginBottom: 12 },
  blockHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editBtn:       { fontSize: 12, color: C.orange, fontFamily: F.bold },

  // Next level
  nextLevelRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLevelName:  { fontSize: 15, fontFamily: F.black },
  nextLevelStats: { flexDirection: 'row', gap: 16 },
  nextStat:       { alignItems: 'center' },
  nextStatVal:    { fontSize: 14, fontFamily: F.black, color: C.text },
  nextStatLabel:  { fontSize: 9, color: C.dim, fontFamily: F.bold, letterSpacing: 1, marginTop: 2 },

  // Why
  whyText:  { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'right', lineHeight: 22 },
  whyEmpty: { fontSize: 14, color: C.dim, textAlign: 'right', fontFamily: F.regular },

  // Milestones
  milestonesRow: { flexDirection: 'row', gap: 8 },
  milestone: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a',
    padding: 12, alignItems: 'center', gap: 4,
  },
  milestoneDone: { borderColor: C.green + '50', backgroundColor: C.green + '0a' },
  milestoneVal:  { fontSize: 13, fontFamily: F.black, color: C.dim },
  milestoneLabel:{ fontSize: 9, fontFamily: F.bold, color: C.dim, textAlign: 'center' },

  // Info rows
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  infoKey:  { fontSize: 13, color: C.muted, fontFamily: F.regular },
  infoVal:  { fontSize: 13, fontFamily: F.bold, color: C.text },

  // Danger
  dangerBtn: {
    marginHorizontal: 16, marginTop: 12,
    borderWidth: 1, borderColor: C.red + '40',
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  dangerBtnText: { color: C.red, fontSize: 13, fontFamily: F.bold, letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  bottomSheet:  { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  sheetHandle:  { width: 36, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle:   { fontSize: 16, fontFamily: F.bold, color: C.text, textAlign: 'right', marginBottom: 16 },
  textArea: {
    backgroundColor: '#0d0d0d', borderWidth: 1.5, borderColor: '#2a2a2a',
    borderRadius: 10, padding: 14, color: C.text, fontSize: 15,
    fontFamily: F.regular, minHeight: 120, marginBottom: 16,
  },
  saveBtn:     { backgroundColor: C.orange, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: F.bold },
})
