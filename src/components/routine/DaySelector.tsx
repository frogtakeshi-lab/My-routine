import type { DayOfWeek } from '@/types';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/lib/constants';

interface Props {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function DaySelector({ selected, onChange }: Props) {
  function toggle(day: DayOfWeek) {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div className="flex gap-1">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selected.includes(day);
        const isSat = day === 'Sat';
        const isSun = day === 'Sun';
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            aria-pressed={isSelected}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : isSun
                ? 'bg-gray-100 text-red-500 hover:bg-red-50'
                : isSat
                ? 'bg-gray-100 text-blue-500 hover:bg-blue-50'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
