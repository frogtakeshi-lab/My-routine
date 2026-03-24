interface Props {
  completed: number;
  total: number;
  percent: number;
}

export function ProgressBar({ completed, total, percent }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-600">
        <span>今日の進捗</span>
        <span className="font-medium">{completed} / {total} 完了</span>
      </div>
      <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
