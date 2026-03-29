import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Habit, DayRecord, Page, Theme, RecordMap } from './types'
import { loadHabits, saveHabits, loadRecords, saveRecords, loadTheme, saveTheme } from './storage'
import { generateId, todayStr, buildRecordMap, getRecordFromMap } from './utils'

interface AppContextType {
  habits: Habit[]
  records: DayRecord[]
  recordMap: RecordMap
  page: Page
  theme: Theme
  setPage: (p: Page) => void
  setTheme: (t: Theme) => void
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: string) => void
  toggleRecord: (habitId: string, date?: string) => void
  getRecord: (habitId: string, date: string) => DayRecord | undefined
  updateMemo: (habitId: string, date: string, memo: string) => void
  updateRecordValue: (habitId: string, date: string, value: number) => void
  importData: (habits: Habit[], records: DayRecord[]) => void
  requestNotificationPermission: () => Promise<boolean>
  scheduleReminders: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(loadHabits)
  const [records, setRecords] = useState<DayRecord[]>(loadRecords)
  const [page, setPage] = useState<Page>('today')
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  // O(1) record lookups
  const recordMap = useMemo(() => buildRecordMap(records), [records])

  useEffect(() => { saveHabits(habits) }, [habits])
  useEffect(() => { saveRecords(records) }, [records])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    saveTheme(t)
    document.documentElement.classList.toggle('light', t === 'light')
  }, [])

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [])

  const addHabit = useCallback((data: Omit<Habit, 'id' | 'createdAt'>) => {
    const habit: Habit = { ...data, id: generateId(), createdAt: todayStr() }
    setHabits(prev => [...prev, habit])
  }, [])

  const updateHabit = useCallback((habit: Habit) => {
    setHabits(prev => prev.map(h => h.id === habit.id ? habit : h))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setRecords(prev => prev.filter(r => r.habitId !== id))
  }, [])

  const toggleRecord = useCallback((habitId: string, date?: string) => {
    const d = date || todayStr()
    setRecords(prev => {
      const existing = prev.find(r => r.habitId === habitId && r.date === d)
      if (existing) {
        if (existing.completed) {
          return prev.filter(r => !(r.habitId === habitId && r.date === d))
        }
        return prev.map(r =>
          r.habitId === habitId && r.date === d ? { ...r, completed: true } : r
        )
      }
      return [...prev, { date: d, habitId, completed: true }]
    })
  }, [])

  const getRecord = useCallback((habitId: string, date: string) => {
    return getRecordFromMap(recordMap, habitId, date)
  }, [recordMap])

  const updateMemo = useCallback((habitId: string, date: string, memo: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.habitId === habitId && r.date === date)
      if (existing) {
        return prev.map(r =>
          r.habitId === habitId && r.date === date ? { ...r, memo } : r
        )
      }
      return [...prev, { date, habitId, completed: false, memo }]
    })
  }, [])

  const updateRecordValue = useCallback((habitId: string, date: string, value: number) => {
    setRecords(prev => {
      const existing = prev.find(r => r.habitId === habitId && r.date === date)
      if (existing) {
        return prev.map(r =>
          r.habitId === habitId && r.date === date ? { ...r, value } : r
        )
      }
      return [...prev, { date, habitId, completed: false, value }]
    })
  }, [])

  const importData = useCallback((newHabits: Habit[], newRecords: DayRecord[]) => {
    setHabits(newHabits)
    setRecords(newRecords)
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const scheduleReminders = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    habits.forEach(habit => {
      if (!habit.reminderTime) return
      const [h, m] = habit.reminderTime.split(':').map(Number)
      const reminderMinutes = h * 60 + m
      if (Math.abs(currentMinutes - reminderMinutes) < 1) {
        new Notification(habit.name, {
          body: `${habit.timeOfDay}の習慣の時間です`,
          icon: '/pwa-192x192.png',
          tag: habit.id,
        })
      }
    })
  }, [habits])

  useEffect(() => {
    const interval = setInterval(scheduleReminders, 60000)
    return () => clearInterval(interval)
  }, [scheduleReminders])

  return (
    <AppContext.Provider value={{
      habits, records, recordMap, page, theme, setPage, setTheme,
      addHabit, updateHabit, deleteHabit,
      toggleRecord, getRecord, updateMemo, updateRecordValue,
      importData, requestNotificationPermission, scheduleReminders,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
