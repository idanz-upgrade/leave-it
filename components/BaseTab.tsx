import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, SafeAreaView, Animated, Image, ImageSourcePropType,
} from 'react-native'
import { useStore, Task, TriggerEntry, LEVEL_REQUIREMENTS, Sport, Setback } from '@/lib/store'
import { C, F } from '@/lib/theme'
import VictoryModal from '@/components/VictoryModal'
import TriggerJournalModal from '@/components/TriggerJournalModal'

function computeNextLevel(streak: number, xp: number): number {
  let level = 1
  for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 1; i--) {
    if (streak >= LEVEL_REQUIREMENTS[i].streak && xp >= LEVEL_REQUIREMENTS[i].xp) {
      level = i + 1; break
    }
  }
  return level
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

// ── Avatar images per sport per level ──────────────────────────────────────
const SPORT_IMAGES: Record<Sport, Partial<Record<number, ImageSourcePropType>>> = {
  football: {
    1: require('../assets/avatar/level01.png'),
  },
  basketball: {},
  tennis: {},
  running: {},
}

function getAvatarImage(sport: Sport | null, level: number): ImageSourcePropType | undefined {
  return SPORT_IMAGES[sport ?? 'football']?.[level]
}

// ── Greeting Header ──────────────────────────────────────────────────────────
function GreetingHeader({ name, streak }: { name: string; streak: number }) {
  const hour = new Date().getHours()
  const timeGreet = hour >= 5 && hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב'

  let text: string
  if (streak === 0) {
    text = `${timeGreet}, ${name || 'גיבור'} 💪`
  } else if (streak === 1) {
    text = `היום מתחיל המסע שלך, ${name || 'גיבור'}`
  } else {
    text = `יום ${streak} ברצף — תמשיך ככה 🔥`
  }

  return (
    <View style={s.greetingWrap}>
      <Text style={s.greetingText}>{text}</Text>
    </View>
  )
}

// ── Week History ─────────────────────────────────────────────────────────────
const DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

function WeekHistory({ streakStartDate, lastCompletedDate, setbacks }: {
  streakStartDate: string | null
  lastCompletedDate: string | null
  setbacks: Setback[]
}) {
  const today = getTodayString()

  // Build current week Sun→Sat (i=0 is Sunday=א׳, i=6 is Saturday=ש׳)
  const todayDate = new Date()
  const sundayOffset = todayDate.getDay() // 0=Sun … 6=Sat

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate)
    d.setDate(todayDate.getDate() - sundayOffset + i)
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === today
    const hasSetback = setbacks.some(sb => sb.createdAt.startsWith(dateStr))
    const isClean = !hasSetback
      && !!streakStartDate
      && dateStr >= streakStartDate
      && (dateStr < today || (isToday && lastCompletedDate === today))
    return { dateStr, label: DAY_LABELS[i], isToday, hasSetback, isClean }
  }).reverse()

  return (
    <View style={s.weekRow}>
      {days.map(day => (
        <View key={day.dateStr} style={s.weekDayCol}>
          <View style={[
            s.weekCircle,
            day.isClean    && s.weekCircleGreen,
            day.hasSetback && s.weekCircleRed,
            day.isToday    && s.weekCircleToday,
          ]}>
            {day.hasSetback
              ? <Text style={s.weekX}>✕</Text>
              : day.isClean
                ? <Text style={s.weekCheck}>✓</Text>
                : null
            }
          </View>
          <Text style={[s.weekDayLabel, day.isToday && { color: C.orange }]}>{day.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection({ level, sport }: { level: number; sport: Sport | null }) {
  const idx = Math.min(level - 1, 9)
  const req = LEVEL_REQUIREMENTS[idx]
  const aura = req.aura ?? C.orange
  const image = getAvatarImage(sport, level)

  const offsetY    = useRef(new Animated.Value(0)).current
  const glowOpacity = useRef(new Animated.Value(0.25)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(offsetY, { toValue: -12, duration: 2400, useNativeDriver: true }),
        Animated.timing(offsetY, { toValue: 0,   duration: 2400, useNativeDriver: true }),
      ])
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.5,  duration: 2200, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.25, duration: 2200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={s.heroSection}>
      {/* Level badge */}
      <View style={[s.lvlBadge, { borderColor: aura + '70' }]}>
        <Text style={[s.lvlBadgeText, { color: aura }]}>רמה {String(level).padStart(2, '0')}</Text>
      </View>

      {/* Ground glow */}
      <Animated.View style={[s.heroGlow, { backgroundColor: aura, opacity: glowOpacity }]} />

      {/* Character */}
      <Animated.View style={[s.heroChar, { transform: [{ translateY: offsetY }] }]}>
        {image ? (
          <Image source={image} style={s.heroImage} resizeMode="contain" />
        ) : (
          <Text style={s.heroEmoji}>{req.emoji}</Text>
        )}
      </Animated.View>

      <Text style={s.heroName}>{req.name}</Text>
      <Text style={s.heroNameEn}>{req.nameEn.toUpperCase()}</Text>
    </View>
  )
}

// ── Stats HUD ───────────────────────────────────────────────────────────────
function StatsHUD({ streak, xp, level }: { streak: number; xp: number; level: number }) {
  return (
    <View style={s.statsHUD}>
      <View style={s.statCol}>
        <Text style={s.statValue}>{streak}</Text>
        <Text style={s.statLabel}>ימים ברצף</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statCol}>
        <Text style={s.statValue}>{level}</Text>
        <Text style={s.statLabel}>רמה</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statCol}>
        <Text style={[s.statValue, { color: C.orange }]}>{xp.toLocaleString()}</Text>
        <Text style={s.statLabel}>ניקוד</Text>
      </View>
    </View>
  )
}

// ── XP Progress ─────────────────────────────────────────────────────────────
function XPProgress({ level, xp }: { level: number; xp: number }) {
  const currentReq = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const nextReq = LEVEL_REQUIREMENTS[Math.min(level, 9)]

  if (level >= 10) {
    return (
      <View style={s.xpBarWrap}>
        <Text style={[s.xpCenter, { color: C.orange }]}>רמה מקסימלית — אלוף עולם</Text>
      </View>
    )
  }

  const currentXP = xp - currentReq.xp
  const neededXP  = nextReq.xp - currentReq.xp
  const pct = Math.min(Math.max(currentXP / neededXP, 0), 1)

  return (
    <View style={s.xpBarWrap}>
      <View style={s.xpBarRow}>
        <Text style={s.xpLvl}>רמה {level}</Text>
        <Text style={s.xpCenter}>{currentXP.toLocaleString()} / {neededXP.toLocaleString()} ניקוד</Text>
        <Text style={[s.xpLvl, { color: C.orange }]}>רמה {level + 1}</Text>
      </View>
      <View style={s.xpTrack}>
        <View style={[s.xpFill, { width: `${pct * 100}%` as any }]} />
      </View>
      <Text style={s.xpNextName}>{nextReq.name} ←</Text>
    </View>
  )
}

// ── Mission Row ─────────────────────────────────────────────────────────────
function MissionRow({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <View style={s.missionRow}>
      <TouchableOpacity onPress={() => toggleTask(task.id)} style={s.missionCheck} activeOpacity={0.7}>
        <View style={[s.checkBox, task.isCompleted && s.checkBoxDone]}>
          {task.isCompleted && <Text style={s.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <Text style={[s.missionTitle, task.isCompleted && s.missionTitleDone]} numberOfLines={1}>
        {task.title}
      </Text>

      {task.isCompleted ? (
        <Text style={s.xpDone}>+50 XP</Text>
      ) : (
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={s.menuBtn} activeOpacity={0.7}>
          <Text style={{ color: '#333', fontSize: 18 }}>···</Text>
        </TouchableOpacity>
      )}

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={s.menuOverlay} onPress={() => setMenuOpen(false)} activeOpacity={1}>
          <View style={s.menuBox}>
            <TouchableOpacity onPress={() => { deleteTask(task.id); setMenuOpen(false) }} style={s.menuItem}>
              <Text style={s.menuDelete}>מחק משימה</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// ── Add Task Modal ──────────────────────────────────────────────────────────
function AddTaskModal({ category, onClose }: { category: Task['category']; onClose: () => void }) {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')
  const labels: Record<Task['category'], string> = {
    morning: 'שגרת בוקר',
    anytime: 'במהלך היום',
    evening: 'שגרת ערב',
  }

  const handleAdd = () => {
    if (title.trim()) { addTask({ title: title.trim(), category, icon: '' }); onClose() }
  }

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>{labels[category]}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="שם המשימה..."
            placeholderTextColor={C.dim}
            style={s.addInput}
            textAlign="right"
            autoFocus
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity onPress={handleAdd} style={s.addBtn} activeOpacity={0.85}>
            <Text style={s.addBtnText}>הוסף</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

// ── Mission Section ─────────────────────────────────────────────────────────
const TIME_LABELS: Record<Task['category'], string> = {
  morning: 'בוקר',
  anytime: 'במהלך היום',
  evening: 'ערב',
}

function MissionSection({ category, tasks }: { category: Task['category']; tasks: Task[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const catTasks = tasks.filter(t => t.category === category)
  const doneCount = catTasks.filter(t => t.isCompleted).length
  const allDone = catTasks.length > 0 && doneCount === catTasks.length

  return (
    <View style={s.missionSection}>
      <View style={s.missionCatHeader}>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addMissionBtn} activeOpacity={0.7}>
          <Text style={{ color: C.orange, fontSize: 20, lineHeight: 20 }}>+</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[s.missionCat, allDone && { color: C.green }]}>{TIME_LABELS[category]}</Text>
          <Text style={s.missionCount}>{doneCount}/{catTasks.length}</Text>
        </View>
      </View>

      {catTasks.map(t => <MissionRow key={t.id} task={t} />)}
      {catTasks.length === 0 && <Text style={s.emptyMission}>הוסף משימה ראשונה</Text>}

      {showAdd && <AddTaskModal category={category} onClose={() => setShowAdd(false)} />}
    </View>
  )
}


// ── End Day Button ───────────────────────────────────────────────────────────
function EndDayButton({ completed, onPress }: { completed: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current
  const [celebrated, setCelebrated] = useState(false)

  const handlePress = () => {
    if (completed) return
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start()
    setCelebrated(true)
    onPress()
  }

  if (completed) {
    return (
      <View style={s.endDayDone}>
        <Text style={s.endDayDoneText}>✓ היום הושלם — Streak עלה!</Text>
      </View>
    )
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} style={s.endDayBtn} activeOpacity={0.85}>
        <Text style={s.endDayBtnText}>סיים את היום  +1 🔥</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function BaseTab() {
  const {
    tasks, level, xp, currentStreak, onboardingData,
    lastCompletedDate, completeDay, addTriggerEntry, userName, streakStartDate, setbacks,
  } = useStore()
  const sport = onboardingData?.sport ?? null

  const doneTasks    = tasks.filter((t: Task) => t.isCompleted).length
  const totalTasks   = tasks.length
  const dayCompleted = lastCompletedDate === getTodayString()

  const [journalVisible, setJournalVisible] = useState(false)
  const [victoryVisible, setVictoryVisible] = useState(false)
  const [victoryStreak,  setVictoryStreak]  = useState(1)
  const [leveledUp,      setLeveledUp]      = useState(false)
  const [newLevelName,   setNewLevelName]   = useState('')

  // Capture pre-completeDay values so journal can use them
  const pendingRef = React.useRef<{ nextStreak: number; nextLevel: number } | null>(null)

  const handleCompleteDay = () => {
    const nextStreak = currentStreak + 1
    const nextLevel  = computeNextLevel(nextStreak, xp)
    pendingRef.current = { nextStreak, nextLevel }
    setJournalVisible(true)
  }

  const handleJournalComplete = (data: Omit<TriggerEntry, 'id' | 'date'>) => {
    setJournalVisible(false)
    addTriggerEntry(data)
    const { nextStreak, nextLevel } = pendingRef.current!
    const didLevelUp = nextLevel > level
    completeDay()
    setVictoryStreak(nextStreak)
    setLeveledUp(didLevelUp)
    setNewLevelName(LEVEL_REQUIREMENTS[Math.min(nextLevel - 1, 9)].name)
    setVictoryVisible(true)
  }

  return (
    <SafeAreaView style={s.container}>
      <GreetingHeader name={userName} streak={currentStreak} />
      <StatsHUD streak={currentStreak} xp={xp} level={level} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <WeekHistory
          streakStartDate={streakStartDate}
          lastCompletedDate={lastCompletedDate}
          setbacks={setbacks}
        />
        <HeroSection level={level} sport={sport} />
        <XPProgress level={level} xp={xp} />

        {/* Daily Missions block */}
        <View style={s.missionsBlock}>
          <View style={s.missionsHeader}>
            <View style={[
              s.missionsBadge,
              doneTasks === totalTasks && totalTasks > 0 && s.missionsBadgeDone,
            ]}>
              <Text style={[
                s.missionsBadgeText,
                doneTasks === totalTasks && totalTasks > 0 && { color: C.green },
              ]}>
                {doneTasks}/{totalTasks}
              </Text>
            </View>
            <Text style={s.missionsTitle}>משימות יומיות</Text>
          </View>

          <MissionSection category="morning" tasks={tasks} />
          <View style={s.sectionDivider} />
          <MissionSection category="anytime" tasks={tasks} />
          <View style={s.sectionDivider} />
          <MissionSection category="evening" tasks={tasks} />
        </View>

        {/* End Day */}
        <View style={s.endDayWrap}>
          <EndDayButton completed={dayCompleted} onPress={handleCompleteDay} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <TriggerJournalModal
        visible={journalVisible}
        onComplete={handleJournalComplete}
      />

      <VictoryModal
        visible={victoryVisible}
        streak={victoryStreak}
        leveledUp={leveledUp}
        newLevelName={newLevelName}
        onClose={() => setVictoryVisible(false)}
      />
    </SafeAreaView>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { paddingBottom: 20 },

  // Greeting
  greetingWrap: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6,
  },
  greetingText: {
    fontSize: 22, fontFamily: F.black, color: C.text, textAlign: 'right',
  },

  // Week history
  weekRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  weekDayCol:  { alignItems: 'center', gap: 6 },
  weekCircle:  {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1a1a1a', borderWidth: 1.5, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
  weekCircleGreen:  { backgroundColor: C.green + '20', borderColor: C.green },
  weekCircleRed:    { backgroundColor: C.red   + '15', borderColor: C.red   },
  weekCircleToday:  { borderColor: C.orange, borderWidth: 2 },
  weekCheck:        { fontSize: 14, color: C.green, fontFamily: F.black },
  weekX:            { fontSize: 12, color: C.red,   fontFamily: F.black },
  weekDayLabel:     { fontSize: 9, fontFamily: F.bold, color: C.dim, letterSpacing: 0.5 },

  // Stats HUD
  statsHUD: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#ffffff08',
  },
  statCol:     { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 20, fontFamily: F.black, color: C.text, letterSpacing: 0.5 },
  statLabel:   { fontSize: 9, fontFamily: F.bold, color: C.dim, letterSpacing: 2, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#1e1e1e' },

  // Hero
  heroSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 8, position: 'relative' },
  lvlBadge: {
    position: 'absolute', top: 16, left: 20,
    borderWidth: 1, borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#ffffff06',
  },
  lvlBadgeText: { fontSize: 10, fontFamily: F.black, letterSpacing: 1 },
  heroGlow: {
    position: 'absolute', bottom: 40,
    width: 220, height: 50, borderRadius: 110,
    alignSelf: 'center',
  },
  heroChar:   { alignItems: 'center' },
  heroImage:  { width: 260, height: 300 },
  heroEmoji:  { fontSize: 110 },
  heroName:   { fontSize: 26, fontFamily: F.black, color: C.text, marginTop: 8 },
  heroNameEn: { fontSize: 10, color: C.dim, fontFamily: F.black, letterSpacing: 3, marginTop: 4 },

  // XP bar
  xpBarWrap: { paddingHorizontal: 20, paddingVertical: 16 },
  xpBarRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLvl:     { fontSize: 10, fontFamily: F.black, color: C.dim, letterSpacing: 1.5 },
  xpCenter:  { fontSize: 11, fontFamily: F.bold, color: C.muted },
  xpTrack:   { height: 3, backgroundColor: '#1e1e1e', borderRadius: 2, overflow: 'hidden' },
  xpFill:    { height: '100%', backgroundColor: C.orange, borderRadius: 2 },
  xpNextName:{ fontSize: 10, color: C.orange, fontFamily: F.bold, textAlign: 'right', marginTop: 8, letterSpacing: 0.5 },

  // Missions block
  missionsBlock: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff06',
    overflow: 'hidden',
  },
  missionsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#ffffff06',
  },
  missionsTitle:       { fontSize: 10, fontFamily: F.black, color: C.dim, letterSpacing: 2.5 },
  missionsBadge:       { borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  missionsBadgeDone:   { borderColor: C.green + '50', backgroundColor: C.green + '12' },
  missionsBadgeText:   { fontSize: 10, fontFamily: F.bold, color: C.dim },
  sectionDivider:      { height: 1, backgroundColor: '#ffffff05', marginHorizontal: 16 },

  // Mission section
  missionSection:   { paddingHorizontal: 16, paddingVertical: 12 },
  missionCatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  missionCat:       { fontSize: 9, fontFamily: F.black, color: C.dim, letterSpacing: 2.5 },
  missionCount:     { fontSize: 9, fontFamily: F.bold, color: '#2a2a2a' },
  addMissionBtn:    { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  emptyMission:     { color: '#2a2a2a', fontSize: 13, fontFamily: F.regular, paddingVertical: 8, textAlign: 'right' },

  // Mission row
  missionRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  missionCheck:     { padding: 2 },
  checkBox:         { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  checkBoxDone:     { backgroundColor: C.green, borderColor: C.green },
  checkMark:        { color: '#fff', fontSize: 11, fontFamily: F.black },
  missionTitle:     { flex: 1, fontSize: 14, color: C.text, fontFamily: F.regular, textAlign: 'right' },
  missionTitleDone: { color: '#2a2a2a', textDecorationLine: 'line-through' },
  xpDone:           { fontSize: 10, color: C.green, fontFamily: F.bold, letterSpacing: 0.5 },
  menuBtn:          { padding: 4 },
  menuOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  menuBox:          { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 4, minWidth: 160, borderWidth: 1, borderColor: '#2a2a2a' },
  menuItem:         { padding: 14 },
  menuDelete:       { color: C.red, fontSize: 14, fontFamily: F.regular, textAlign: 'right' },

  // Bottom sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  bottomSheet:  { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  sheetHandle:  { width: 36, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle:   { fontSize: 16, fontFamily: F.bold, color: C.text, textAlign: 'right', marginBottom: 16 },
  addInput: {
    backgroundColor: '#0d0d0d', borderWidth: 1.5, borderColor: '#2a2a2a',
    borderRadius: 10, padding: 14, color: C.text, fontSize: 15,
    fontFamily: F.regular, marginBottom: 16,
  },
  addBtn:     { backgroundColor: C.orange, borderRadius: 10, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 15, fontFamily: F.bold },

  // End Day
  endDayWrap: { marginHorizontal: 16, marginTop: 16 },
  endDayBtn: {
    backgroundColor: C.green, borderRadius: 16, padding: 20,
    alignItems: 'center',
  },
  endDayBtnText: { color: '#fff', fontSize: 17, fontFamily: F.black, letterSpacing: 0.5 },
  endDayDone: {
    borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: C.green + '40', backgroundColor: C.green + '0d',
  },
  endDayDoneText: { color: C.green, fontSize: 15, fontFamily: F.bold },

})
