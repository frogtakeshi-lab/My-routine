'use client';

import { useLogContext } from '@/context/LogContext';
import { getTodayKey } from '@/lib/date';

export function useDailyLogs() {
  const { logs, dispatch } = useLogContext();

  const todayKey = getTodayKey();
  const todayLogs = logs.filter((l) => l.date === todayKey);

  function toggleCompletion(routineId: string) {
    dispatch({ type: 'TOGGLE', routineId });
  }

  function isCompleted(routineId: string): boolean {
    return todayLogs.some((l) => l.routineId === routineId && l.completed);
  }

  function getProgress(total: number) {
    const completed = todayLogs.filter((l) => l.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  }

  return { toggleCompletion, isCompleted, getProgress };
}
