import type { Routine } from '@/types';
import { DAY_LABELS } from '@/lib/constants';
import { formatDisplayTime } from '@/lib/date';
import { Toggle } from '@/components/ui/Toggle';

interface Props {
  routine: Routine;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
}

export function RoutineListItem({ routine, onEdit, onDelete, onToggleEnabled }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${routine.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
            {routine.name}
          </p>
          {routine.time && (
            <span className="text-xs text-gray-400 flex-shrink-0">{formatDisplayTime(routine.time)}</span>
          )}
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {routine.days.map((day) => (
            <span key={day} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs font-medium">
              {DAY_LABELS[day]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Toggle checked={routine.enabled} onChange={onToggleEnabled} label="有効/無効" />
        <button
          onClick={onEdit}
          aria-label="編集"
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          aria-label="削除"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
