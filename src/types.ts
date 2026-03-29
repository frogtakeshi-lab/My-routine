export type Category = '健康' | '学習' | '仕事' | '趣味' | 'その他'

export type Frequency = 'daily' | 'weekly'

export type Priority = 'A' | 'B'

export type Theme = 'dark' | 'light'

export interface Habit {
  id: string
  name: string
  category: Category
  frequency: Frequency
  weeklyTarget?: number
  weeklyDays?: number[] // 0=Sun, 1=Mon, ..., 6=Sat
  timeOfDay: '朝' | '昼' | '夜' | 'いつでも'
  priority: Priority
  targetValue?: number
  targetUnit?: string
  reminderTime?: string // HH:MM
  createdAt: string
  color: string
}

export interface DayRecord {
  date: string // YYYY-MM-DD
  habitId: string
  completed: boolean
  memo?: string
  value?: number
}

export type Page = 'today' | 'habits' | 'calendar' | 'stats' | 'settings'

/** Map key: `${habitId}:${date}` */
export type RecordMap = Map<string, DayRecord>
