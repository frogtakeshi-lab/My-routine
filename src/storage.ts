import type { Habit, DayRecord, Theme } from './types'

const HABITS_KEY = 'myRoutine_habits'
const RECORDS_KEY = 'myRoutine_records'
const THEME_KEY = 'myRoutine_theme'

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(HABITS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function loadRecords(): DayRecord[] {
  try {
    const data = localStorage.getItem(RECORDS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRecords(records: DayRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function loadTheme(): Theme {
  try {
    const data = localStorage.getItem(THEME_KEY)
    return (data === 'light' || data === 'dark') ? data : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
}

/** Export all app data as JSON string */
export function exportData(habits: Habit[], records: DayRecord[]): string {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    records,
  }, null, 2)
}

/** Import data from JSON string. Returns parsed data or null on error. */
export function parseImportData(json: string): { habits: Habit[]; records: DayRecord[] } | null {
  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data.habits) || !Array.isArray(data.records)) return null
    return { habits: data.habits, records: data.records }
  } catch {
    return null
  }
}
