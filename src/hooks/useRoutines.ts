'use client';

import { useRoutineContext } from '@/context/RoutineContext';
import type { Routine, DayOfWeek } from '@/types';
import { getDayOfWeek } from '@/lib/date';

export function useRoutines() {
  const { routines, dispatch } = useRoutineContext();

  const todaysRoutines = routines.filter(
    (r) => r.enabled && r.days.includes(getDayOfWeek() as DayOfWeek)
  );

  function addRoutine(data: Omit<Routine, 'id' | 'createdAt'>) {
    const routine: Routine = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD', routine });
  }

  function updateRoutine(routine: Routine) {
    dispatch({ type: 'UPDATE', routine });
  }

  function deleteRoutine(id: string) {
    dispatch({ type: 'DELETE', id });
  }

  function toggleEnabled(id: string) {
    dispatch({ type: 'TOGGLE_ENABLED', id });
  }

  return { routines, todaysRoutines, addRoutine, updateRoutine, deleteRoutine, toggleEnabled };
}
