export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Routine {
  id: string;
  name: string;
  time: string | null; // "HH:MM" 24-hour format
  days: DayOfWeek[];
  enabled: boolean;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  routineId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  completedAt: string | null;
}

export interface NotificationSettings {
  enabled: boolean;
}
