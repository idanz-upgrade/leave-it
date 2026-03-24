import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, SafeAreaView, Alert,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
} from 'react-native-reanimated'
import { useStore, Task, LEVEL_REQUIREMENTS } from '@/lib/store'
import { C, F } from '@/lib/theme'

function FloatingIsland({ level }: { level: number }) {
  const req = LEVEL_REQUIREMENTS[Math.min(level - 1, 9)]
  const nextReq = LEVEL_REQUIREMENTS[Math.min(level, 9)]
  const offsetY = useSharedValue(0)

  React.useEffect(() => {
    offsetY.value = withRepeat(
      withSequence(withTiming(-8, { duration: 1500 }), withTiming(0, { duration: 1500 })),
      -1, true
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offsetY.value }] }))

  return (
    <View style={s.islandCard}>
      <View style={s.islandGlow} />
      <Animated.Text style={[s.islandEmoji, animStyle]}>{req.emoji}</Animated.Text>
      <Text style={s.islandLevelTag}>רמה {level}</Text>
      <Text style={s.islandName}>{req.name}</Text>
      <Text style={s.islandNameEn}>{req.nameEn}</Text>
    </View>
  )
}

function DailyProgress({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter(t => t.isCompleted).length
  const total = tasks.length
  const pct = total > 0 ? completed / total : 0

  return (
    <View style={s.progressCard}>
      <View style={s.progressRow}>
        <Text style={[s.progressPct, { color: pct === 1 ? C.green : C.orange }]}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={s.progressLabel}>היום: {completed}/{total} הושלמו</Text>
      </View>
      <View style={s.progressBg}>
        <Animated.View style={[s.progressFill, {
          width: `${pct * 100}%`,
          backgroundColor: pct === 1 ? C.green : C.orange,
        }]} />
      </View>
    </View>
  )
}

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <View style={s.taskRow}>
      <TouchableOpacity onPress={() => toggleTask(task.id)} style={s.taskCheck} activeOpacity={0.7}>
        <View style={[s.checkCircle, task.isCompleted && s.checkCircleDone]}>
          {task.isCompleted && <Text style={s.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <Text style={s.taskIcon}>{task.icon}</Text>

      <Text style={[s.taskTitle, task.isCompleted && s.taskTitleDone]} numberOfLines={1}>
        {task.title}
      </Text>

      {task.isCompleted && <Text style={s.xpBadge}>+50 XP</Text>}

      <TouchableOpacity onPress={() => setMenuOpen(true)} style={s.menuBtn} activeOpacity={0.7}>
        <Text style={{ color: C.dim, fontSize: 18 }}>⋮</Text>
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity style={s.menuOverlay} onPress={() => setMenuOpen(false)} activeOpacity={1}>
          <View style={s.menuBox}>
            <TouchableOpacity
              onPress={() => { deleteTask(task.id); setMenuOpen(false) }}
              style={s.menuItem}
            >
              <Text style={s.menuItemDelete}>🗑 מחק משימה</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function AddTaskModal({ category, onClose }: { category: Task['category']; onClose: () => void }) {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')
  const labels = { morning: 'שגרת בוקר', anytime: 'במהלך היום', evening: 'שגרת ערב' }

  const handleAdd = () => {
    if (title.trim()) { addTask({ title: title.trim(), category, icon: '✅' }); onClose() }
  }

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity activeOpacity={1} style={s.bottomSheet}>
          <View style={s.bottomSheetHeader}>
            <TouchableOpacity onPress={onClose}><Text style={{ color: C.dim, fontSize: 20 }}>✕</Text></TouchableOpacity>
            <Text style={s.bottomSheetTitle}>הוסף משימה — {labels[category]}</Text>
          </View>
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

function TaskCategory({ title, category, tasks }: { title: string; category: Task['category']; tasks: Task[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const catTasks = tasks.filter(t => t.category === category)
  const allDone = catTasks.length > 0 && catTasks.every(t => t.isCompleted)

  return (
    <View style={s.categoryCard}>
      <View style={s.categoryHeader}>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addCatBtn} activeOpacity={0.7}>
          <Text style={{ color: C.dim, fontSize: 16 }}>+</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {allDone && <Text style={s.doneBadge}>✓ הושלם</Text>}
          <Text style={s.categoryTitle}>{title}</Text>
        </View>
      </View>

      {catTasks.map(task => <TaskItem key={task.id} task={task} />)}
      {catTasks.length === 0 && (
        <Text style={s.emptyText}>לחץ + להוספת משימה</Text>
      )}

      {showAdd && <AddTaskModal category={category} onClose={() => setShowAdd(false)} />}
    </View>
  )
}

function PanicModal({ onClose }: { onClose: () => void }) {
  const { usePanicButton } = useStore()
  const handleSurvived = () => { usePanicButton(); onClose() }

  return (
    <Modal visible transparent animationType="fade">
      <View style={s.panicOverlay}>
        <TouchableOpacity style={s.panicClose} onPress={onClose}>
          <Text style={{ color: C.dim, fontSize: 20 }}>✕</Text>
        </TouchableOpacity>

        <View style={s.panicContent}>
          <Text style={{ fontSize: 64 }}>🛡️</Text>
          <Text style={s.panicTitle}>רגע של חולשה</Text>
          <Text style={s.panicSubtitle}>זה בסדר. תנשום. אתה חזק יותר מהדחף הזה.</Text>

          <View style={s.panicTip}>
            <Text style={s.panicTipText}>💡 עכשיו: עשה 20 שכיבות סמיכה — עד שהגוף ישכח מה רצה.</Text>
          </View>

          <View style={s.panicTip}>
            <Text style={s.panicTipText}>🌬️ נשימה: שאף 4 שניות, עצור 4, נשוף 8. חזור 3 פעמים.</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleSurvived} style={s.survivedBtn} activeOpacity={0.85}>
          <Text style={s.survivedBtnText}>עברתי את זה! +100 XP 💪</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default function BaseTab() {
  const { tasks, level, xp, currentStreak } = useStore()
  const [panicOpen, setPanicOpen] = useState(false)
  const nextReq = LEVEL_REQUIREMENTS[Math.min(level, 9)]

  return (
    <SafeAreaView style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.streakBadge}>🔥 {currentStreak} ימים</Text>
          <Text style={s.xpBadgeTop}>⚡ {xp} XP</Text>
        </View>
        <Text style={s.screenTitle}>הבסיס שלי</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <FloatingIsland level={level} />
        <DailyProgress tasks={tasks} />

        {/* Next level progress */}
        <View style={s.nextLevelCard}>
          <View style={s.nextLevelRow}>
            <Text style={s.nextLevelTarget}>{nextReq.name} ←</Text>
            <Text style={s.nextLevelLabel}>הרמה הבאה</Text>
          </View>
          <View style={s.nextLevelStats}>
            <Text style={s.nextLevelStat}>🔥 {nextReq.streak} ימי Streak</Text>
            <Text style={s.nextLevelStat}>⚡ {nextReq.xp.toLocaleString()} XP</Text>
          </View>
        </View>

        <TaskCategory title="שגרת בוקר" category="morning" tasks={tasks} />
        <TaskCategory title="במהלך היום" category="anytime" tasks={tasks} />
        <TaskCategory title="שגרת ערב" category="evening" tasks={tasks} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Panic Button */}
      <TouchableOpacity onPress={() => setPanicOpen(true)} style={s.panicBtn} activeOpacity={0.85}>
        <Text style={s.panicBtnText}>⚠️  צריך עזרה? לחץ כאן</Text>
      </TouchableOpacity>

      {panicOpen && <PanicModal onClose={() => setPanicOpen(false)} />}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  screenTitle: { fontSize: 22, fontFamily: F.black, color: C.text },
  streakBadge: { fontSize: 13, color: C.dim, fontFamily: F.regular },
  xpBadgeTop: { fontSize: 13, color: C.orange, fontFamily: F.bold },
  scrollContent: { paddingHorizontal: 16, gap: 12, paddingBottom: 20 },

  islandCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center', overflow: 'hidden' },
  islandGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: C.orangeDim },
  islandEmoji: { fontSize: 64, marginBottom: 12 },
  islandLevelTag: { fontSize: 11, color: C.dim, fontFamily: F.bold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  islandName: { fontSize: 20, fontFamily: F.black, color: C.text },
  islandNameEn: { fontSize: 12, color: C.dim, fontFamily: F.regular, marginTop: 2 },

  progressCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, color: C.muted, fontFamily: F.regular },
  progressPct: { fontSize: 14, fontFamily: F.bold },
  progressBg: { backgroundColor: C.border, borderRadius: 99, height: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },

  nextLevelCard: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14 },
  nextLevelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nextLevelLabel: { fontSize: 13, color: C.muted, fontFamily: F.regular },
  nextLevelTarget: { fontSize: 13, color: C.orange, fontFamily: F.bold },
  nextLevelStats: { flexDirection: 'row', gap: 16 },
  nextLevelStat: { fontSize: 12, color: C.dim, fontFamily: F.regular },

  categoryCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  categoryTitle: { fontSize: 13, fontFamily: F.bold, color: C.muted, letterSpacing: 1 },
  doneBadge: { fontSize: 11, color: C.green, fontFamily: F.bold },
  addCatBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#333', fontSize: 14, textAlign: 'center', paddingVertical: 12, fontFamily: F.regular },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  taskCheck: { padding: 2 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#3a3a3a', alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: C.green, borderColor: C.green },
  checkMark: { color: '#fff', fontSize: 13, fontFamily: F.bold },
  taskIcon: { fontSize: 16 },
  taskTitle: { flex: 1, fontSize: 15, color: C.text, fontFamily: F.regular, textAlign: 'right' },
  taskTitleDone: { color: '#4a4a4a', textDecorationLine: 'line-through' },
  xpBadge: { fontSize: 11, color: C.green, fontFamily: F.bold },
  menuBtn: { padding: 4 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuBox: { backgroundColor: '#222', borderRadius: 10, padding: 4, minWidth: 160, borderWidth: 1, borderColor: '#333' },
  menuItem: { padding: 14 },
  menuItemDelete: { color: C.red, fontSize: 14, fontFamily: F.regular, textAlign: 'right' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bottomSheetTitle: { fontSize: 18, fontFamily: F.bold, color: C.text },
  addInput: { backgroundColor: '#111', borderWidth: 1.5, borderColor: '#333', borderRadius: 10, padding: 14, color: C.text, fontSize: 16, fontFamily: F.regular, marginBottom: 16 },
  addBtn: { backgroundColor: C.orange, borderRadius: 12, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontFamily: F.bold },

  panicBtn: {
    position: 'absolute', bottom: 80, left: 16, right: 16,
    backgroundColor: C.orange, borderRadius: 16, padding: 18,
    alignItems: 'center', shadowColor: C.orange, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  panicBtnText: { color: '#fff', fontSize: 16, fontFamily: F.bold },

  panicOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', padding: 24, justifyContent: 'space-between' },
  panicClose: { alignSelf: 'flex-end', padding: 8, marginTop: 20 },
  panicContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  panicTitle: { fontSize: 28, fontFamily: F.black, color: C.orange, textAlign: 'center' },
  panicSubtitle: { fontSize: 16, fontFamily: F.regular, color: C.muted, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
  panicTip: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20, width: '100%' },
  panicTipText: { color: C.text, fontSize: 15, fontFamily: F.regular, textAlign: 'right', lineHeight: 24 },
  survivedBtn: { backgroundColor: C.green, borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 10 },
  survivedBtnText: { color: '#fff', fontSize: 17, fontFamily: F.bold },
})
