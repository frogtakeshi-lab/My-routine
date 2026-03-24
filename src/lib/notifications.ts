import type { Routine } from '@/types';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function scheduleNotifications(routines: Routine[]): () => void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return () => {};
  }

  const timeoutIds: ReturnType<typeof setTimeout>[] = [];
  const now = new Date();

  for (const routine of routines) {
    if (!routine.enabled || !routine.time) continue;

    const [h, m] = routine.time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);

    const delay = target.getTime() - now.getTime();
    if (delay <= 0) continue; // Already passed today

    const id = setTimeout(() => {
      new Notification(`🔔 ${routine.name}`, {
        body: 'ルーティンの時間です！',
        icon: '/favicon.ico',
      });
    }, delay);

    timeoutIds.push(id);
  }

  return () => {
    timeoutIds.forEach(clearTimeout);
  };
}
