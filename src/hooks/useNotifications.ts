'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Routine } from '@/types';
import { requestNotificationPermission, scheduleNotifications } from '@/lib/notifications';

export function useNotifications(routines: Routine[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Schedule notifications for today's routines on mount/change
  useEffect(() => {
    if (routines.length === 0) return;
    const cleanup = scheduleNotifications(routines);
    return cleanup;
  }, [routines]);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  }, []);

  return { permission, requestPermission };
}
