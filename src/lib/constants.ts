import type { DayOfWeek } from '@/types';

export const STORAGE_KEYS = {
  ROUTINES: 'my-routine:routines',
  LOGS: 'my-routine:logs',
  SETTINGS: 'my-routine:settings',
} as const;

export const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  Mon: '月',
  Tue: '火',
  Wed: '水',
  Thu: '木',
  Fri: '金',
  Sat: '土',
  Sun: '日',
};

export const LOG_RETENTION_DAYS = 30;
