import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Task {
  id: string
  title: string
  category: 'morning' | 'anytime' | 'evening'
  isCompleted: boolean
  date: string
  xpEarned: number
  icon?: string
}

export interface CheckIn {
  id: string
  mood: number
  temptationLevel: number
  triggers: string[]
  notes: string
  createdAt: string
}

export interface Setback {
  id: string
  trigger: string
  notes: string
  createdAt: string
}

export interface TriggerEntry {
  id: string
  date: string
  hadUrge: boolean
  trigger?: string
  resisted?: boolean
  note?: string
}

export type Sport = 'football' | 'basketball' | 'tennis' | 'running'

export interface OnboardingData {
  name: string
  nickname: string
  sport: Sport | null
  hobby: string
  symptoms: string[]
  habitDuration: string
  frequency: string
  triedBefore: string
  triggers: string[]
  dangerPlaces: string[]
  dangerTime: string
  costs: string[]
  goals: string[]
  primaryGoal: string
  motivationType: string
  yourWhy: string
  languageStyle: 'secular' | 'religious'
  selectedMorningTasks: string[]
  selectedAnytimeTasks: string[]
  selectedEveningTasks: string[]
}

export const LEVEL_REQUIREMENTS = [
  { streak: 0,   xp: 0,     name: 'ילד הרחוב',     nameEn: 'Street Kid',          emoji: '🧒', aura: '#a16207', sceneBg: '#1a0e04' },
  { streak: 7,   xp: 500,   name: 'שחקן נוער',     nameEn: 'Youth Player',        emoji: '⚽', aura: '#15803d', sceneBg: '#031a0a' },
  { streak: 14,  xp: 1500,  name: 'שחקן קדמות',    nameEn: 'Junior League',       emoji: '🏃', aura: '#1d4ed8', sceneBg: '#030f1a' },
  { streak: 21,  xp: 3000,  name: 'ספסלאי',        nameEn: 'On The Bench',        emoji: '🎽', aura: '#4338ca', sceneBg: '#08081e' },
  { streak: 30,  xp: 5000,  name: 'פורץ לראשונה',  nameEn: 'Breaking Through',    emoji: '⚡', aura: '#f97316', sceneBg: '#120800' },
  { streak: 45,  xp: 8000,  name: 'קפטן הקבוצה',   nameEn: 'Team Captain',        emoji: '🦁', aura: '#dc2626', sceneBg: '#1a0404' },
  { streak: 60,  xp: 12000, name: 'שחקן נבחרת',    nameEn: 'National Team',       emoji: '🌍', aura: '#2563eb', sceneBg: '#020818' },
  { streak: 75,  xp: 18000, name: 'אלוף אירופה',   nameEn: 'European Champion',   emoji: '🏆', aura: '#ca8a04', sceneBg: '#141000' },
  { streak: 90,  xp: 25000, name: 'כדור זהב',       nameEn: "Ballon d'Or",         emoji: '⭐', aura: '#f59e0b', sceneBg: '#1a1000' },
  { streak: 120, xp: 40000, name: 'אלוף העולם',     nameEn: 'World Cup GOAT',      emoji: '👑', aura: '#fbbf24', sceneBg: '#0d0d0d' },
]

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Icons for tasks
const TASK_ICONS: Record<string, string> = {
  // Morning
  'אין טלפון 30 דקות ראשונות': '📵',
  'מקלחת קרה':                 '🚿',
  'אימון בוקר':                '🏋️',
  'סידור המיטה':               '🛏️',
  'הליכה בבוקר':               '🚶',
  // Anytime
  'אימון':                     '💪',
  'קריאת 20 עמודים':           '📖',
  'הליכה':                     '🚶',
  'סשן עבודה ממוקדת':          '🧠',
  'ללא רשתות חברתיות (2 שעות)': '📵',
  // Evening
  'טלפון הצידה ב-22:00':       '📵',
  'יומן':                      '📓',
  'קריאה לפני שינה':           '📚',
  'מתיחות ערב / יוגה':         '🤸',
  'תכנון למחר':                '📋',
}

function buildTasksFromOnboarding(data: OnboardingData): Task[] {
  const today = getTodayString()
  const tasks: Task[] = []

  const add = (titles: string[], category: Task['category']) => {
    titles.forEach(title => {
      tasks.push({
        id: generateId(),
        title,
        category,
        isCompleted: false,
        date: today,
        xpEarned: 0,
        icon: TASK_ICONS[title] ?? (category === 'morning' ? '🌅' : category === 'evening' ? '🌙' : '⚡'),
      })
    })
  }

  add(data.selectedMorningTasks,  'morning')
  add(data.selectedAnytimeTasks,  'anytime')
  add(data.selectedEveningTasks,  'evening')

  // Fallback: if user somehow skipped task selection, add defaults
  if (tasks.length === 0) {
    return [
      { id: generateId(), title: 'מקלחת קרה',         category: 'morning',  isCompleted: false, date: today, xpEarned: 0, icon: '🚿' },
      { id: generateId(), title: 'אימון',              category: 'anytime',  isCompleted: false, date: today, xpEarned: 0, icon: '💪' },
      { id: generateId(), title: 'טלפון הצידה ב-22:00', category: 'evening', isCompleted: false, date: today, xpEarned: 0, icon: '📵' },
    ]
  }
  return tasks
}

const DEFAULT_TASKS = [
  { title: 'מקלחת קרה',            category: 'morning'  as const, icon: '🚿' },
  { title: 'הליכה 15 דק׳',          category: 'morning'  as const, icon: '🚶' },
  { title: 'מדיטציה קצרה',          category: 'morning'  as const, icon: '🧘' },
  { title: 'אימון כושר',            category: 'anytime'  as const, icon: '💪' },
  { title: 'סשן עבודה עמוקה',       category: 'anytime'  as const, icon: '🧠' },
  { title: 'קריאת ספר',             category: 'anytime'  as const, icon: '📚' },
  { title: 'תכנון המחר',            category: 'evening'  as const, icon: '📋' },
  { title: 'הרחקת טלפון ב-22:00',   category: 'evening'  as const, icon: '📵' },
  { title: 'מתיחות קלות',           category: 'evening'  as const, icon: '🤸' },
]

function buildTodayTasks(): Task[] {
  const today = getTodayString()
  return DEFAULT_TASKS.map(t => ({
    ...t, id: generateId(), date: today, isCompleted: false, xpEarned: 0,
  }))
}

function calculateLevel(streak: number, xp: number): number {
  let level = 1
  for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 1; i--) {
    const req = LEVEL_REQUIREMENTS[i]
    if (streak >= req.streak && xp >= req.xp) { level = i + 1; break }
  }
  return level
}

interface State {
  onboardingCompleted: boolean
  onboardingData: OnboardingData | null
  userName: string
  currentStreak: number
  longestStreak: number
  totalCleanDays: number
  xp: number
  level: number
  totalXP: number
  resilience: number
  lastCheckinDate: string | null
  lastSlipupDate: string | null
  streakStartDate: string | null
  tasks: Task[]
  lastTaskDate: string | null
  lastCompletedDate: string | null
  checkins: CheckIn[]
  setbacks: Setback[]
  triggerJournal: TriggerEntry[]
  isPro: boolean
  panicButtonUsedToday: number
  totalTasksCompleted: number
}

interface Actions {
  completeOnboarding: (data: OnboardingData) => void
  toggleTask: (taskId: string) => void
  addTask: (task: Omit<Task, 'id' | 'date' | 'isCompleted' | 'xpEarned'>) => void
  deleteTask: (taskId: string) => void
  addCheckin: (checkin: Omit<CheckIn, 'id' | 'createdAt'>) => void
  reportSetback: (trigger: string, notes: string) => void
  usePanicButton: () => void
  addTriggerEntry: (data: Omit<TriggerEntry, 'id' | 'date'>) => void
  setPro: (value: boolean) => void
  setYourWhy: (why: string) => void
  startNewDay: () => void
  completeDay: () => void
  resetAll: () => void
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      onboardingCompleted: false,
      onboardingData: null,
      userName: '',
      currentStreak: 0,
      longestStreak: 0,
      totalCleanDays: 0,
      xp: 0,
      level: 1,
      totalXP: 0,
      resilience: 0,
      lastCheckinDate: null,
      lastSlipupDate: null,
      streakStartDate: null,
      tasks: buildTodayTasks(),
      lastTaskDate: getTodayString(),
      lastCompletedDate: null,
      checkins: [],
      setbacks: [],
      triggerJournal: [],
      isPro: false,
      panicButtonUsedToday: 0,
      totalTasksCompleted: 0,

      completeOnboarding: (data) => set({
        onboardingCompleted: true,
        onboardingData: data,
        userName: data.name,
        tasks: buildTasksFromOnboarding(data),
        lastTaskDate: getTodayString(),
        streakStartDate: getTodayString(),
      }),

      toggleTask: (taskId) => {
        const state = get()
        const today = getTodayString()
        if (state.lastTaskDate !== today) {
          const freshTasks = state.onboardingData
            ? buildTasksFromOnboarding(state.onboardingData)
            : buildTodayTasks()
          set({ tasks: freshTasks, lastTaskDate: today, panicButtonUsedToday: 0 })
          return
        }
        const tasks = state.tasks.map(t =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted, xpEarned: !t.isCompleted ? 50 : 0 } : t
        )
        let xpGain = 0
        const toggled = tasks.find(t => t.id === taskId)
        if (toggled?.isCompleted) {
          xpGain += 50
          const cats: Task['category'][] = ['morning', 'anytime', 'evening']
          for (const cat of cats) {
            const catTasks = tasks.filter(t => t.category === cat)
            if (catTasks.length > 0 && catTasks.every(t => t.isCompleted)) xpGain += 100
          }
          if (tasks.every(t => t.isCompleted)) xpGain += 250
        } else {
          xpGain -= 50
        }
        const newXP = Math.max(0, state.xp + xpGain)
        const taskDelta = toggled?.isCompleted ? 1 : -1
        set({
          tasks,
          xp: newXP,
          totalXP: Math.max(0, state.totalXP + xpGain),
          level: calculateLevel(state.currentStreak, newXP),
          totalTasksCompleted: Math.max(0, state.totalTasksCompleted + taskDelta),
        })
      },

      addTask: (task) => set(s => ({
        tasks: [...s.tasks, { ...task, id: generateId(), date: getTodayString(), isCompleted: false, xpEarned: 0 }]
      })),

      deleteTask: (taskId) => set(s => ({ tasks: s.tasks.filter(t => t.id !== taskId) })),

      addCheckin: (checkin) => {
        const state = get()
        const newXP = state.xp + 25
        set(s => ({
          checkins: [{ ...checkin, id: generateId(), createdAt: new Date().toISOString() }, ...s.checkins],
          lastCheckinDate: getTodayString(),
          xp: newXP,
          totalXP: s.totalXP + 25,
          resilience: s.resilience + 1,
          level: calculateLevel(s.currentStreak, newXP),
        }))
      },

      reportSetback: (trigger, notes) => set(s => ({
        setbacks: [{ id: generateId(), trigger, notes, createdAt: new Date().toISOString() }, ...s.setbacks],
        totalCleanDays: s.totalCleanDays + s.currentStreak,
        currentStreak: 0,
        streakStartDate: getTodayString(),
        lastSlipupDate: getTodayString(),
        lastCompletedDate: null,
      })),

      usePanicButton: () => set(s => {
        const newXP = s.xp + 100
        return {
          panicButtonUsedToday: s.panicButtonUsedToday + 1,
          xp: newXP,
          totalXP: s.totalXP + 100,
          resilience: s.resilience + 1,
          level: calculateLevel(s.currentStreak, newXP),
        }
      }),

      setPro: (value) => set({ isPro: value }),

      setYourWhy: (why) => set(s => ({
        onboardingData: s.onboardingData ? { ...s.onboardingData, yourWhy: why } : s.onboardingData,
      })),

      addTriggerEntry: (data) => set(s => ({
        triggerJournal: [
          { ...data, id: generateId(), date: getTodayString() },
          ...s.triggerJournal,
        ],
      })),

      startNewDay: () => set(s => {
        const today = getTodayString()
        if (s.lastTaskDate === today) return {}
        const freshTasks = s.onboardingData
          ? buildTasksFromOnboarding(s.onboardingData)
          : buildTodayTasks()
        return { tasks: freshTasks, lastTaskDate: today, panicButtonUsedToday: 0 }
      }),

      completeDay: () => set(s => {
        const today = getTodayString()
        if (s.lastCompletedDate === today) return {}  // already completed today
        const newStreak = s.currentStreak + 1
        return {
          lastCompletedDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(s.longestStreak, newStreak),
          level: calculateLevel(newStreak, s.xp),
        }
      }),

      resetAll: () => set({
        onboardingCompleted: false,
        onboardingData: null,
        userName: '',
        currentStreak: 0,
        longestStreak: 0,
        totalCleanDays: 0,
        xp: 0,
        level: 1,
        totalXP: 0,
        resilience: 0,
        lastCheckinDate: null,
        lastSlipupDate: null,
        streakStartDate: null,
        tasks: buildTodayTasks(),
        lastTaskDate: getTodayString(),
        lastCompletedDate: null,
        checkins: [],
        setbacks: [],
        triggerJournal: [],
        isPro: false,
        panicButtonUsedToday: 0,
        totalTasksCompleted: 0,
      }),
    }),
    {
      name: 'leave-it-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
