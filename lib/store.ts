import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  mood: number // 1-5
  temptationLevel: number // 1-5
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

export interface OnboardingData {
  habitDuration: string
  frequency: string
  age: number
  mainGoal: string
  yourWhy: string
  languageStyle: 'secular' | 'religious'
}

export interface UserState {
  // Auth
  isAuthenticated: boolean
  userId: string | null
  email: string | null

  // Onboarding
  onboardingCompleted: boolean
  onboardingData: OnboardingData | null

  // Progress
  currentStreak: number
  longestStreak: number
  xp: number
  level: number
  totalXP: number
  resilience: number // never resets
  lastCheckinDate: string | null
  lastSlipupDate: string | null
  streakStartDate: string | null

  // Daily tasks
  tasks: Task[]
  lastTaskDate: string | null

  // History
  checkins: CheckIn[]
  setbacks: Setback[]

  // UI
  activeTab: 'base' | 'insights' | 'community' | 'resources' | 'profile'
  panicButtonUsedToday: number
}

export interface UserActions {
  setActiveTab: (tab: UserState['activeTab']) => void
  completeOnboarding: (data: OnboardingData) => void
  toggleTask: (taskId: string) => void
  addTask: (task: Omit<Task, 'id' | 'date' | 'isCompleted' | 'xpEarned'>) => void
  deleteTask: (taskId: string) => void
  addCheckin: (checkin: Omit<CheckIn, 'id' | 'createdAt'>) => void
  reportSetback: (trigger: string, notes: string) => void
  usePanicButton: () => void
  resetDailyTasks: () => void
  login: (email: string, userId: string) => void
  logout: () => void
}

const DEFAULT_TASKS: Omit<Task, 'id' | 'date' | 'isCompleted' | 'xpEarned'>[] = [
  { title: 'מקלחת קרה', category: 'morning', icon: '🚿' },
  { title: 'הליכה 15 דק׳', category: 'morning', icon: '🚶' },
  { title: 'מדיטציה קצרה', category: 'morning', icon: '🧘' },
  { title: 'אימון כושר', category: 'anytime', icon: '💪' },
  { title: 'סשן עבודה עמוקה', category: 'anytime', icon: '🧠' },
  { title: 'קריאת ספר', category: 'anytime', icon: '📚' },
  { title: 'תכנון המחר', category: 'evening', icon: '📋' },
  { title: 'הרחקת טלפון ב-22:00', category: 'evening', icon: '📵' },
  { title: 'מתיחות קלות', category: 'evening', icon: '🤸' },
]

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function buildTodayTasks(): Task[] {
  const today = getTodayString()
  return DEFAULT_TASKS.map(t => ({
    ...t,
    id: generateId(),
    date: today,
    isCompleted: false,
    xpEarned: 0,
  }))
}

// XP needed to reach each level
export const LEVEL_REQUIREMENTS: { streak: number; xp: number; name: string; nameEn: string }[] = [
  { streak: 0, xp: 0, name: 'מחנה בסיס', nameEn: 'Campsite' },
  { streak: 7, xp: 500, name: 'מוצב', nameEn: 'Outpost' },
  { streak: 14, xp: 1500, name: 'התיישבות', nameEn: 'Settlement' },
  { streak: 21, xp: 3000, name: 'מבצר עץ', nameEn: 'Fort' },
  { streak: 30, xp: 5000, name: 'מעוז', nameEn: 'Stronghold' },
  { streak: 45, xp: 8000, name: 'מצודה', nameEn: 'Citadel' },
  { streak: 60, xp: 12000, name: 'מבצר אבן', nameEn: 'Fortress' },
  { streak: 75, xp: 18000, name: 'טירה', nameEn: 'Castle' },
  { streak: 90, xp: 25000, name: 'ארמון', nameEn: 'Palace' },
  { streak: 120, xp: 40000, name: 'אימפריה', nameEn: 'Empire' },
]

function calculateLevel(streak: number, xp: number): number {
  let level = 1
  for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 1; i--) {
    const req = LEVEL_REQUIREMENTS[i]
    if (streak >= req.streak && xp >= req.xp) {
      level = i + 1
      break
    }
  }
  return level
}

export const useStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      userId: null,
      email: null,
      onboardingCompleted: false,
      onboardingData: null,
      currentStreak: 0,
      longestStreak: 0,
      xp: 0,
      level: 1,
      totalXP: 0,
      resilience: 0,
      lastCheckinDate: null,
      lastSlipupDate: null,
      streakStartDate: null,
      tasks: buildTodayTasks(),
      lastTaskDate: getTodayString(),
      checkins: [],
      setbacks: [],
      activeTab: 'base',
      panicButtonUsedToday: 0,

      setActiveTab: (tab) => set({ activeTab: tab }),

      login: (email, userId) => set({ isAuthenticated: true, email, userId }),
      logout: () => set({ isAuthenticated: false, email: null, userId: null }),

      completeOnboarding: (data) => set({
        onboardingCompleted: true,
        onboardingData: data,
        tasks: buildTodayTasks(),
        lastTaskDate: getTodayString(),
        streakStartDate: getTodayString(),
      }),

      toggleTask: (taskId) => {
        const state = get()
        const today = getTodayString()

        // Reset tasks if new day
        if (state.lastTaskDate !== today) {
          set({
            tasks: buildTodayTasks(),
            lastTaskDate: today,
            panicButtonUsedToday: 0,
          })
          return
        }

        const tasks = state.tasks.map(t =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted, xpEarned: !t.isCompleted ? 50 : 0 } : t
        )

        // Calculate XP earned
        let xpGain = 0
        const toggled = tasks.find(t => t.id === taskId)
        if (toggled?.isCompleted) {
          xpGain += 50

          // Check category bonus
          const categories: Task['category'][] = ['morning', 'anytime', 'evening']
          for (const cat of categories) {
            const catTasks = tasks.filter(t => t.category === cat)
            if (catTasks.length > 0 && catTasks.every(t => t.isCompleted)) {
              xpGain += 100
            }
          }

          // All tasks bonus
          if (tasks.every(t => t.isCompleted)) {
            xpGain += 250
          }
        } else {
          xpGain -= 50
        }

        const newXP = Math.max(0, state.xp + xpGain)
        const newTotalXP = Math.max(0, state.totalXP + xpGain)
        const newLevel = calculateLevel(state.currentStreak, newXP)

        set({ tasks, xp: newXP, totalXP: newTotalXP, level: newLevel })
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          date: getTodayString(),
          isCompleted: false,
          xpEarned: 0,
        }
        set(s => ({ tasks: [...s.tasks, newTask] }))
      },

      deleteTask: (taskId) => set(s => ({
        tasks: s.tasks.filter(t => t.id !== taskId)
      })),

      addCheckin: (checkin) => {
        const today = getTodayString()
        const newCheckin: CheckIn = {
          ...checkin,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        const xpGain = 25
        const state = get()
        const newXP = state.xp + xpGain
        const newResilience = state.resilience + 1

        set(s => ({
          checkins: [newCheckin, ...s.checkins],
          lastCheckinDate: today,
          xp: newXP,
          totalXP: s.totalXP + xpGain,
          resilience: newResilience,
          level: calculateLevel(s.currentStreak, newXP),
        }))
      },

      reportSetback: (trigger, notes) => {
        const newSetback: Setback = {
          id: generateId(),
          trigger,
          notes,
          createdAt: new Date().toISOString(),
        }
        set(s => ({
          setbacks: [newSetback, ...s.setbacks],
          currentStreak: 0,
          streakStartDate: getTodayString(),
          lastSlipupDate: getTodayString(),
        }))
      },

      usePanicButton: () => {
        const xpGain = 100
        set(s => ({
          panicButtonUsedToday: s.panicButtonUsedToday + 1,
          xp: s.xp + xpGain,
          totalXP: s.totalXP + xpGain,
          resilience: s.resilience + 1,
          level: calculateLevel(s.currentStreak, s.xp + xpGain),
        }))
      },

      resetDailyTasks: () => {
        // Called on new day - also increment streak
        set(s => {
          const newStreak = s.currentStreak + 1
          const newLongest = Math.max(s.longestStreak, newStreak)
          return {
            tasks: buildTodayTasks(),
            lastTaskDate: getTodayString(),
            currentStreak: newStreak,
            longestStreak: newLongest,
            panicButtonUsedToday: 0,
            level: calculateLevel(newStreak, s.xp),
          }
        })
      },
    }),
    {
      name: 'leave-it-storage',
    }
  )
)
