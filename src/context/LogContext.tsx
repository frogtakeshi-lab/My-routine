'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { DailyLog } from '@/types';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { getTodayKey, pruneLogs } from '@/lib/date';

type Action =
  | { type: 'LOAD'; logs: DailyLog[] }
  | { type: 'TOGGLE'; routineId: string };

function reducer(state: DailyLog[], action: Action): DailyLog[] {
  switch (action.type) {
    case 'LOAD':
      return action.logs;
    case 'TOGGLE': {
      const today = getTodayKey();
      const existing = state.find(
        (l) => l.routineId === action.routineId && l.date === today
      );
      if (existing) {
        return state.map((l) =>
          l.routineId === action.routineId && l.date === today
            ? { ...l, completed: !l.completed, completedAt: !l.completed ? new Date().toISOString() : null }
            : l
        );
      }
      const newLog: DailyLog = {
        id: crypto.randomUUID(),
        routineId: action.routineId,
        date: today,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      return [...state, newLog];
    }
    default:
      return state;
  }
}

const LogContext = createContext<{
  logs: DailyLog[];
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const stored = getItem<DailyLog[]>(STORAGE_KEYS.LOGS);
    const pruned = pruneLogs(stored ?? []);
    dispatch({ type: 'LOAD', logs: pruned });
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEYS.LOGS, logs);
  }, [logs]);

  return (
    <LogContext.Provider value={{ logs, dispatch }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogContext() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLogContext must be inside LogProvider');
  return ctx;
}
