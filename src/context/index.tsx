'use client';

import type { ReactNode } from 'react';
import { RoutineProvider } from './RoutineContext';
import { LogProvider } from './LogContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <RoutineProvider>
      <LogProvider>{children}</LogProvider>
    </RoutineProvider>
  );
}
