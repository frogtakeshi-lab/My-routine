import type { DayOfWeek, DailyLog } from '@/types';
import { LOG_RETENTION_DAYS } from '@/lib/constants';

export function getTodayKey(): string {
  return new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
}

export function getDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}

export function formatDisplayTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTodayLabel(): string {
  const now = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = weekdays[now.getDay()];
  return `${month}月${date}日（${day}）`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 18) return 'こんにちは';
  return 'こんばんは';
}

export function pruneLogs(logs: DailyLog[]): DailyLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOG_RETENTION_DAYS);
  const cutoffKey = cutoff.toLocaleDateString('en-CA');
  return logs.filter((log) => log.date >= cutoffKey);
}
