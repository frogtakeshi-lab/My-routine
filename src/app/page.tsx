'use client';

import { useRoutines } from '@/hooks/useRoutines';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { RoutineCard } from '@/components/routine/RoutineCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTodayLabel, getGreeting } from '@/lib/date';

export default function TodayPage() {
  const { todaysRoutines } = useRoutines();
  const { toggleCompletion, isCompleted, getProgress } = useDailyLogs();
  useNotifications(todaysRoutines);

  const progress = getProgress(todaysRoutines.length);
  const allDone = todaysRoutines.length > 0 && progress.percent === 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">{formatTodayLabel()}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{getGreeting()}</h1>
      </div>

      {todaysRoutines.length > 0 && (
        <ProgressBar
          completed={progress.completed}
          total={progress.total}
          percent={progress.percent}
        />
      )}

      {allDone && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-2xl">🎉</span>
          <p className="text-sm font-medium text-green-700">今日のルーティンをすべて完了しました！</p>
        </div>
      )}

      {todaysRoutines.length === 0 ? (
        <EmptyState
          title="今日のルーティンはありません"
          description="ルーティンを追加して、毎日の習慣を始めましょう！"
          actionLabel="ルーティンを追加"
          actionHref="/manage"
        />
      ) : (
        <div className="space-y-2">
          {todaysRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              completed={isCompleted(routine.id)}
              onToggle={() => toggleCompletion(routine.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
