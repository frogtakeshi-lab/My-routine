import { useState } from 'react'
import type { Category, Frequency, Priority } from '../types'
import { CATEGORY_COLORS, HABIT_COLORS } from '../utils'

const CATEGORIES: Category[] = ['健康', '学習', '仕事', '趣味', 'その他']
const TIME_OPTIONS = ['朝', '昼', '夜', 'いつでも'] as const
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const UNIT_OPTIONS = ['分', '回', 'km', 'ページ', '杯', '歩', 'ml']

export interface HabitFormData {
  name: string
  category: Category
  frequency: Frequency
  weeklyTarget: number
  weeklyDays: number[]
  timeOfDay: '朝' | '昼' | '夜' | 'いつでも'
  priority: Priority
  targetValue: number
  targetUnit: string
  reminderTime: string
  color: string
}

export const defaultFormData: HabitFormData = {
  name: '',
  category: '健康',
  frequency: 'daily',
  weeklyTarget: 3,
  weeklyDays: [],
  timeOfDay: 'いつでも',
  priority: 'B',
  targetValue: 0,
  targetUnit: '',
  reminderTime: '',
  color: HABIT_COLORS[0],
}

interface Props {
  initial: HabitFormData
  isEditing: boolean
  onSubmit: (data: HabitFormData) => void
  onCancel: () => void
}

export default function HabitForm({ initial, isEditing, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<HabitFormData>(initial)

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onCancel}>
      <div className="bg-surface w-full rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-4">
          {isEditing ? '習慣を編集' : '新しい習慣'}
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">名前</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="例: 30分ウォーキング"
              className="w-full bg-surface-light rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                    form.category === cat ? 'ring-2 ring-offset-1 ring-offset-surface' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: CATEGORY_COLORS[cat] + '22',
                    color: CATEGORY_COLORS[cat],
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">頻度</label>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ ...form, frequency: 'daily' })}
                className={`text-sm px-4 py-2 rounded-lg ${
                  form.frequency === 'daily' ? 'bg-primary text-white' : 'bg-surface-light'
                }`}
              >
                毎日
              </button>
              <button
                onClick={() => setForm({ ...form, frequency: 'weekly' })}
                className={`text-sm px-4 py-2 rounded-lg ${
                  form.frequency === 'weekly' ? 'bg-primary text-white' : 'bg-surface-light'
                }`}
              >
                週N回
              </button>
            </div>
            {form.frequency === 'weekly' && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-sub">週</span>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={form.weeklyTarget}
                    onChange={e => setForm({ ...form, weeklyTarget: Number(e.target.value) })}
                    className="w-16 bg-surface-light rounded-lg px-3 py-1.5 text-sm text-center outline-none"
                  />
                  <span className="text-sm text-text-sub">回</span>
                </div>
                <div>
                  <span className="text-xs text-text-sub block mb-1">実施する曜日（任意）</span>
                  <div className="flex gap-1">
                    {DAY_LABELS.map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const days = form.weeklyDays.includes(idx)
                            ? form.weeklyDays.filter(d => d !== idx)
                            : [...form.weeklyDays, idx]
                          setForm({ ...form, weeklyDays: days })
                        }}
                        className={`w-9 h-9 rounded-lg text-xs font-medium ${
                          form.weeklyDays.includes(idx)
                            ? 'bg-primary text-white'
                            : 'bg-surface-light text-text-sub'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">優先度</label>
            <div className="flex gap-2">
              {(['A', 'B'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`text-sm px-4 py-2 rounded-lg flex-1 font-medium ${
                    form.priority === p
                      ? p === 'A' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                      : 'bg-surface-light'
                  }`}
                >
                  {p === 'A' ? 'A（重要）' : 'B（通常）'}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric target */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">数値目標（任意）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={form.targetValue || ''}
                onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })}
                placeholder="0"
                className="w-24 bg-surface-light rounded-lg px-3 py-2 text-sm text-center outline-none"
              />
              <div className="flex gap-1 flex-wrap flex-1">
                {UNIT_OPTIONS.map(unit => (
                  <button
                    key={unit}
                    onClick={() => setForm({ ...form, targetUnit: unit })}
                    className={`text-xs px-2.5 py-1.5 rounded-lg ${
                      form.targetUnit === unit ? 'bg-primary text-white' : 'bg-surface-light text-text-sub'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time of day */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">時間帯</label>
            <div className="flex gap-2">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, timeOfDay: t })}
                  className={`text-sm px-4 py-2 rounded-lg flex-1 ${
                    form.timeOfDay === t ? 'bg-primary text-white' : 'bg-surface-light'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">リマインダー通知（任意）</label>
            <input
              type="time"
              value={form.reminderTime}
              onChange={e => setForm({ ...form, reminderTime: e.target.value })}
              className="bg-surface-light rounded-lg px-3 py-2 text-sm outline-none"
            />
            {form.reminderTime && (
              <button
                onClick={() => setForm({ ...form, reminderTime: '' })}
                className="ml-2 text-xs text-text-sub"
              >
                クリア
              </button>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="text-sm text-text-sub mb-1 block">カラー</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-surface-light text-sm">
            キャンセル
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium">
            {isEditing ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
