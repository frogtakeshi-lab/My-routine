import type { Habit, DayRecord, RecordMap } from './types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr(): string {
  return formatDate(new Date())
}

/** Build a Map for O(1) record lookups */
export function buildRecordMap(records: DayRecord[]): RecordMap {
  const map = new Map<string, DayRecord>()
  for (const r of records) {
    map.set(`${r.habitId}:${r.date}`, r)
  }
  return map
}

export function getRecordFromMap(map: RecordMap, habitId: string, date: string): DayRecord | undefined {
  return map.get(`${habitId}:${date}`)
}

/** Check if a habit is due on a specific date (handles weekly day selection) */
export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  if (habit.frequency === 'daily') return true
  if (habit.weeklyDays && habit.weeklyDays.length > 0) {
    return habit.weeklyDays.includes(date.getDay())
  }
  return true
}

export function isHabitDueToday(habit: Habit): boolean {
  return isHabitDueOnDate(habit, new Date())
}

/** Calculate streak, skipping non-due days for weekly habits */
export function getStreak(habit: Habit, rMap: RecordMap): number {
  const today = new Date()
  let streak = 0
  let checkedFirst = false
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (!isHabitDueOnDate(habit, d)) continue
    const dateStr = formatDate(d)
    const rec = rMap.get(`${habit.id}:${dateStr}`)
    if (rec?.completed) {
      streak++
      checkedFirst = true
    } else if (!checkedFirst) {
      // First due day not yet completed (e.g. today) - skip, check earlier
      checkedFirst = true
      continue
    } else {
      break
    }
  }
  return streak
}

/** Completion rate over N days, only counting days the habit is due */
export function getCompletionRate(habit: Habit, rMap: RecordMap, days: number): number {
  const today = new Date()
  let dueDays = 0
  let completed = 0
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (!isHabitDueOnDate(habit, d)) continue
    dueDays++
    const dateStr = formatDate(d)
    const rec = rMap.get(`${habit.id}:${dateStr}`)
    if (rec?.completed) completed++
  }
  return dueDays > 0 ? Math.round((completed / dueDays) * 100) : 0
}

export function getWeekDayLabel(date: Date): string {
  return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export const CATEGORY_COLORS: Record<string, string> = {
  '健康': '#22c55e',
  '学習': '#3b82f6',
  '仕事': '#f59e0b',
  '趣味': '#ec4899',
  'その他': '#8b5cf6',
}

export const HABIT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#22c55e', '#14b8a6', '#3b82f6', '#f97316', '#06b6d4',
]
