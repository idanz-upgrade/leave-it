import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Modal, TextInput, Alert, Image,
  ImageSourcePropType, Switch, Linking,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useStore, LEVEL_REQUIREMENTS, Sport } from '@/lib/store'
import { C, F } from '@/lib/theme'
import { getOrCreateAnonymousId } from '@/lib/leaderboard'
import { supabase } from '@/lib/supabase'

const REMINDERS_KEY = 'smart_reminders_enabled'

const SPORT_IMAGES: Record<Sport, Partial<Record<number, ImageSourcePropType>>> = {
  football:   { 1: require('../assets/avatar/level01.png') },
  basketball: {},
  tennis:     {},
  running:    {},
}

// ── Edit Why Modal ────────────────────────────────────────────────────────────
function EditWhyModal({ current, onSave, onClose }: {
  current: string; onSave: (v: string) => void; onClose: () => void
}) {
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

// ── Milestone Row with progress bar ──────────────────────────────────────────
function MilestoneRow({ icon, label, current, target }: {
  icon: string; label: string; current: number; target: number
}) {
  const pct = Math.min(1, current / target)
  const done = current >= target
  return (
    <View style={s.milestoneRow}>
      <Text style={s.milestoneIcon}>{done ? '✅' : icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={s.milestoneMeta}>
          <Text style={[s.milestoneCount, done && s.milestoneDoneText]}>
            {Math.min(current, target)}/{target}
          </Text>
          <Text style={[s.milestoneLabel, done && s.milestoneDoneText]}>{label}</Text>
        </View>
        <View style={s.milestoneTrack}>
          <View style={[s.milestoneFill, { width: `${pct * 100}%` as any }, done && s.milestoneFillDone]} />
        </View>
      </View>
    </View>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const router = useRouter()
  const {
    onboardingData, currentStreak, longestStreak, xp, level,
    setbacks, checkins, resetAll, setYourWhy, totalTasksCompleted,
  } = useStore()

  const [editingWhy, setEditingWhy]         = useState(false)
  const [remindersOn, setRemindersOn]       = useState(true)

  const why  = onboardingData?.yourWhy ?? ''
  const req  = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const nextReq = LEVEL_REQUIREMENTS[Math.min(level, 9)]
  const aura = req.aura ?? C.orange
  const sport = onboardingData?.sport ?? null
  const image = SPORT_IMAGES[sport ?? 'football']?.[level]

  // Load reminders pref
  useEffect(() => {
    AsyncStorage.getItem(REMINDERS_KEY).then(v => {
      if (v !== null) setRemindersOn(v === 'true')
    }).catch(() => {})
  }, [])

  const toggleReminders = async (val: boolean) => {
    setRemindersOn(val)
    await AsyncStorage.setItem(REMINDERS_KEY, String(val)).catch(() => {})
  }

  const handleResetProgress = () => {
    Alert.alert(
      'אפס את כל ההתקדמות',
      'כל הנתונים יימחקו לצמיתות — streak, XP, משימות, צ׳ק-אינים. האם אתה בטוח?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אפס הכל',
          style: 'destructive',
          onPress: () => { resetAll(); router.replace('/onboarding') },
        },
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'מחיקת חשבון',
      'פעולה זו בלתי הפיכה. כל הנתונים יימחקו לצמיתות, כולל המיקום שלך בלוח המובילים.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק לצמיתות',
          style: 'destructive',
          onPress: async () => {
            try {
              const anonId = await getOrCreateAnonymousId()
              if (supabase) {
                await supabase.from('leaderboard').delete().eq('anonymous_id', anonId)
              }
            } catch {}
            try { await AsyncStorage.clear() } catch {}
            resetAll()
            router.replace('/onboarding')
          },
        },
      ]
    )
  }

  const handleRestorePurchases = () => {
    Alert.alert('שחזור רכישות', 'רכישות שוחזרו בהצלחה ✓')
  }

  const handleContactFounder = () => {
    Linking.openURL('mailto:messer94@gmail.com?subject=שליטה - פידבק').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את אפליקציית המייל')
    })
  }

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
          <View style={[s.lvlTag, { borderColor: aura + '70' }]}>
            <Text style={[s.lvlTagText, { color: aura }]}>רמה {String(level).padStart(2, '0')}</Text>
          </View>
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

        {/* YOUR WHY */}
        <View style={s.block}>
          <View style={s.blockHeaderRow}>
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.editBtn}>{why ? 'ערוך' : '+ הוסף'}</Text>
            </TouchableOpacity>
            <Text style={s.blockLabel}>YOUR WHY</Text>
          </View>
          {why ? (
            <Text style={s.whyText}>"{why}"</Text>
          ) : (
            <TouchableOpacity onPress={() => setEditingWhy(true)} activeOpacity={0.7}>
              <Text style={s.whyEmpty}>+ הוסף את הסיבה שלך</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Milestones */}
        <View style={s.block}>
          <Text style={s.blockLabel}>הישגים</Text>
          <MilestoneRow icon="🔥" label="7 ימים רצופים"   current={currentStreak}        target={7}   />
          <MilestoneRow icon="🔥" label="30 ימים רצופים"  current={currentStreak}        target={30}  />
          <MilestoneRow icon="🔥" label="90 ימים רצופים"  current={currentStreak}        target={90}  />
          <MilestoneRow icon="✅" label="100 משימות"       current={totalTasksCompleted}  target={100} />
        </View>

        {/* Smart Reminders */}
        <View style={s.block}>
          <Text style={s.blockLabel}>הגדרות</Text>
          <View style={s.settingRow}>
            <Switch
              value={remindersOn}
              onValueChange={toggleReminders}
              trackColor={{ false: '#2a2a2a', true: C.orange + '88' }}
              thumbColor={remindersOn ? C.orange : '#555'}
            />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={s.settingTitle}>תזכורות חכמות</Text>
              <Text style={s.settingSub}>התראות יומיות ובשעות סיכון</Text>
            </View>
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

        {/* Contact the Founder */}
        <TouchableOpacity onPress={handleContactFounder} style={s.contactCard} activeOpacity={0.8}>
          <View style={s.contactLeft}>
            <Text style={s.contactTitle}>צור קשר עם המייסד</Text>
            <Text style={s.contactSub}>דווח על באג או שתף פידבק</Text>
          </View>
          <Text style={s.contactArrow}>✉️</Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity onPress={handleRestorePurchases} style={s.restoreBtn} activeOpacity={0.8}>
          <Text style={s.restoreBtnText}>שחזר רכישות</Text>
        </TouchableOpacity>

        {/* ── DANGER ZONE ── */}
        <View style={s.dangerZone}>
          <View style={s.dangerHeader}>
            <Text style={s.dangerTitle}>DANGER ZONE</Text>
            <Text style={s.dangerIcon}>⚠️</Text>
          </View>

          <TouchableOpacity onPress={handleResetProgress} style={s.dangerBtn} activeOpacity={0.8}>
            <Text style={s.dangerBtnText}>אפס את כל ההתקדמות</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeleteAccount} style={[s.dangerBtn, { marginTop: 8 }]} activeOpacity={0.8}>
            <Text style={s.dangerBtnText}>מחק חשבון</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      {editingWhy && (
        <EditWhyModal
          current={why}
          onSave={(v) => setYourWhy(v)}
          onClose={() => setEditingWhy(false)}
        />
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
    alignItems: 'center', paddingVertical: 28,
    borderBottomWidth: 1, borderBottomColor: '#ffffff06',
    overflow: 'hidden', position: 'relative',
  },
  cardGlow:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  lvlTag:     { borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#ffffff06', marginBottom: 12 },
  lvlTagText: { fontSize: 10, fontFamily: F.black, letterSpacing: 1.5 },
  charImage:  { width: 180, height: 200 },
  charEmoji:  { fontSize: 90 },
  charName:   { fontSize: 22, fontFamily: F.black, color: C.text, marginTop: 8 },
  charNameEn: { fontSize: 9, color: C.dim, fontFamily: F.black, letterSpacing: 3, marginTop: 4 },

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
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff06', padding: 16,
  },
  blockLabel:     { fontSize: 9, fontFamily: F.black, color: C.dim, letterSpacing: 2.5, textAlign: 'right', marginBottom: 12 },
  blockHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editBtn:        { fontSize: 12, color: C.orange, fontFamily: F.bold },

  // Next level
  nextLevelRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLevelName:  { fontSize: 15, fontFamily: F.black },
  nextLevelStats: { flexDirection: 'row', gap: 16 },
  nextStat:       { alignItems: 'center' },
  nextStatVal:    { fontSize: 14, fontFamily: F.black, color: C.text },
  nextStatLabel:  { fontSize: 9, color: C.dim, fontFamily: F.bold, letterSpacing: 1, marginTop: 2 },

  // Why
  whyText:  { fontSize: 15, fontFamily: F.regular, color: C.muted, textAlign: 'right', lineHeight: 22, fontStyle: 'italic' },
  whyEmpty: { fontSize: 14, color: C.dim, textAlign: 'right', fontFamily: F.regular },

  // Milestones
  milestoneRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  milestoneIcon:  { fontSize: 20, width: 26, textAlign: 'center' },
  milestoneMeta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  milestoneLabel: { fontSize: 12, fontFamily: F.bold, color: C.muted, textAlign: 'right' },
  milestoneCount: { fontSize: 12, fontFamily: F.black, color: C.dim },
  milestoneDoneText: { color: C.green },
  milestoneTrack: { height: 5, backgroundColor: '#1a1a1a', borderRadius: 99, overflow: 'hidden' },
  milestoneFill:  { height: '100%', backgroundColor: C.orange, borderRadius: 99 },
  milestoneFillDone: { backgroundColor: C.green },

  // Settings row
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingTitle: { fontSize: 14, fontFamily: F.bold, color: C.text, textAlign: 'right' },
  settingSub:   { fontSize: 11, color: C.dim, fontFamily: F.regular, textAlign: 'right', marginTop: 2 },

  // Info rows
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  infoKey:  { fontSize: 13, color: C.muted, fontFamily: F.regular },
  infoVal:  { fontSize: 13, fontFamily: F.bold, color: C.text },

  // Contact card
  contactCard: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: '#ffffff06',
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  contactLeft:  { flex: 1, alignItems: 'flex-end' },
  contactTitle: { fontSize: 14, fontFamily: F.bold, color: C.text, textAlign: 'right' },
  contactSub:   { fontSize: 11, color: C.dim, fontFamily: F.regular, textAlign: 'right', marginTop: 3 },
  contactArrow: { fontSize: 24, marginLeft: 12 },

  // Restore button
  restoreBtn: {
    marginHorizontal: 16, marginTop: 10,
    borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  restoreBtnText: { color: C.dim, fontSize: 13, fontFamily: F.bold },

  // Danger zone
  dangerZone: {
    marginHorizontal: 16, marginTop: 20,
    borderWidth: 1, borderColor: C.red + '30',
    borderRadius: 14, padding: 16,
    backgroundColor: C.red + '06',
  },
  dangerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dangerTitle:  { fontSize: 10, fontFamily: F.black, color: C.red + 'aa', letterSpacing: 2 },
  dangerIcon:   { fontSize: 16 },
  dangerBtn: {
    borderWidth: 1, borderColor: C.red + '40',
    borderRadius: 10, padding: 14, alignItems: 'center',
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
