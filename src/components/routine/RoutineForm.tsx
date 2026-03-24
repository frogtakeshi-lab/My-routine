'use client';

import { useState } from 'react';
import type { Routine, DayOfWeek } from '@/types';
import { DaySelector } from './DaySelector';
import { Button } from '@/components/ui/Button';

interface Props {
  initial?: Partial<Routine>;
  onSubmit: (data: Omit<Routine, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function RoutineForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [days, setDays] = useState<DayOfWeek[]>(initial?.days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [useTime, setUseTime] = useState(!!initial?.time);
  const [time, setTime] = useState(initial?.time ?? '');

  const isValid = name.trim().length > 0 && days.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      time: useTime && time ? time : null,
      days,
      enabled: initial?.enabled ?? true,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ルーティン名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 朝のストレッチ"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          曜日 <span className="text-red-500">*</span>
        </label>
        <DaySelector selected={days} onChange={setDays} />
        {days.length === 0 && (
          <p className="text-xs text-red-500 mt-1">少なくとも1つ選択してください</p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={useTime}
            onChange={(e) => setUseTime(e.target.checked)}
            className="rounded text-indigo-600"
          />
          リマインダー時刻を設定
        </label>
        {useTime && (
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" disabled={!isValid} className="flex-1">
          {initial?.id ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  );
}
