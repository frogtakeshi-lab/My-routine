import type { Routine } from '@/types';
import { formatDisplayTime } from '@/lib/date';

interface Props {
  routine: Routine;
  completed: boolean;
  onToggle: () => void;
}

export function RoutineCard({ routine, completed, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={`${routine.name} - ${completed ? '完了済み' : '未完了'}`}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all min-h-[64px] text-left ${
        completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {routine.name}
        </p>
        {routine.time && (
          <p className="text-xs text-gray-400 mt-0.5">{formatDisplayTime(routine.time)}</p>
        )}
      </div>
    </button>
  );
}
