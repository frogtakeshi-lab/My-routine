'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Routine } from '@/types';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

type Action =
  | { type: 'LOAD'; routines: Routine[] }
  | { type: 'ADD'; routine: Routine }
  | { type: 'UPDATE'; routine: Routine }
  | { type: 'DELETE'; id: string }
  | { type: 'TOGGLE_ENABLED'; id: string };

function reducer(state: Routine[], action: Action): Routine[] {
  switch (action.type) {
    case 'LOAD':
      return action.routines;
    case 'ADD':
      return [...state, action.routine];
    case 'UPDATE':
      return state.map((r) => (r.id === action.routine.id ? action.routine : r));
    case 'DELETE':
      return state.filter((r) => r.id !== action.id);
    case 'TOGGLE_ENABLED':
      return state.map((r) => (r.id === action.id ? { ...r, enabled: !r.enabled } : r));
    default:
      return state;
  }
}

const RoutineContext = createContext<{
  routines: Routine[];
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const stored = getItem<Routine[]>(STORAGE_KEYS.ROUTINES);
    if (stored) dispatch({ type: 'LOAD', routines: stored });
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEYS.ROUTINES, routines);
  }, [routines]);

  return (
    <RoutineContext.Provider value={{ routines, dispatch }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutineContext() {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error('useRoutineContext must be inside RoutineProvider');
  return ctx;
}
