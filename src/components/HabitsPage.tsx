import { useState } from 'react'
import { useApp } from '../context'
import type { Habit, Category } from '../types'
import { CATEGORY_COLORS, getStreak, getCompletionRate } from '../utils'
import HabitForm, { defaultFormData, type HabitFormData } from './HabitForm'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

interface HabitTemplate {
  name: string
  category: Category
  frequency: 'daily' | 'weekly'
  timeOfDay: '朝' | '昼' | '夜' | 'いつでも'
  targetValue?: number
  targetUnit?: string
  priority: 'A' | 'B'
}

const TEMPLATES: HabitTemplate[] = [
  { name: 'ウォーキング 30分', category: '健康', frequency: 'daily', timeOfDay: '朝', targetValue: 30, targetUnit: '分', priority: 'A' },
  { name: '水を2L飲む', category: '健康', frequency: 'daily', timeOfDay: 'いつでも', targetValue: 2000, targetUnit: 'ml', priority: 'B' },
  { name: '読書', category: '学習', frequency: 'daily', timeOfDay: '夜', targetValue: 30, targetUnit: '分', priority: 'B' },
  { name: '英語学習', category: '学習', frequency: 'daily', timeOfDay: '朝', targetValue: 15, targetUnit: '分', priority: 'A' },
  { name: '筋トレ', category: '健康', frequency: 'weekly', timeOfDay: '朝', targetValue: 30, targetUnit: '分', priority: 'A' },
  { name: '瞑想', category: '健康', frequency: 'daily', timeOfDay: '朝', targetValue: 10, targetUnit: '分', priority: 'B' },
  { name: '日記を書く', category: '趣味', frequency: 'daily', timeOfDay: '夜', priority: 'B' },
  { name: 'ストレッチ', category: '健康', frequency: 'daily', timeOfDay: '朝', targetValue: 10, targetUnit: '分', priority: 'B' },
]

export default function HabitsPage() {
  const { habits, recordMap, addHabit, updateHabit, deleteHabit } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formInitial, setFormInitial] = useState<HabitFormData>(defaultFormData)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openAdd = () => {
    setFormInitial(defaultFormData)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (habit: Habit) => {
    setFormInitial({
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      weeklyTarget: habit.weeklyTarget || 3,
      weeklyDays: habit.weeklyDays || [],
      timeOfDay: habit.timeOfDay,
      priority: habit.priority || 'B',
      targetValue: habit.targetValue || 0,
      targetUnit: habit.targetUnit || '',
      reminderTime: habit.reminderTime || '',
      color: habit.color,
    })
    setEditingId(habit.id)
    setShowForm(true)
  }

  const applyTemplate = (t: HabitTemplate) => {
    setFormInitial({
      ...defaultFormData,
      name: t.name,
      category: t.category,
      frequency: t.frequency,
      timeOfDay: t.timeOfDay,
      targetValue: t.targetValue || 0,
      targetUnit: t.targetUnit || '',
      priority: t.priority,
    })
    setShowTemplates(false)
    setEditingId(null)
    setShowForm(true)
  }

  const handleFormSubmit = (form: HabitFormData) => {
    const data = {
      ...form,
      targetValue: form.targetValue || undefined,
      targetUnit: form.targetUnit || undefined,
      reminderTime: form.reminderTime || undefined,
      weeklyDays: form.weeklyDays.length > 0 ? form.weeklyDays : undefined,
    }
    if (editingId) {
      const existing = habits.find(h => h.id === editingId)!
      updateHabit({ ...existing, ...data })
    } else {
      addHabit(data)
    }
    setShowForm(false)
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">習慣一覧</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="bg-surface-light px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            テンプレ
          </button>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            追加
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-text-sub">
          <p className="text-lg mb-2">習慣を登録しましょう</p>
          <p className="text-sm">「追加」ボタンから始めてください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...habits].sort((a, b) => (a.priority || 'B').localeCompare(b.priority || 'B')).map(habit => {
            const streak = getStreak(habit, recordMap)
            const rate = getCompletionRate(habit, recordMap, 30)
            return (
              <div key={habit.id} className="bg-surface rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: habit.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{habit.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        habit.priority === 'A' ? 'bg-red-500/20 text-red-400' : 'bg-text-muted/20 text-text-sub'
                      }`}>
                        {habit.priority || 'B'}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[habit.category] + '22', color: CATEGORY_COLORS[habit.category] }}
                      >
                        {habit.category}
                      </span>
                      <span className="text-[10px] text-text-sub">
                        {habit.frequency === 'daily' ? '毎日' : `週${habit.weeklyTarget}回`}
                      </span>
                      <span className="text-[10px] text-text-sub">{habit.timeOfDay}</span>
                      {habit.targetValue && habit.targetUnit && (
                        <span className="text-[10px] text-primary-light">目標: {habit.targetValue}{habit.targetUnit}</span>
                      )}
                      {habit.reminderTime && (
                        <span className="text-[10px] text-blue-400">{habit.reminderTime}通知</span>
                      )}
                    </div>
                    {habit.weeklyDays && habit.weeklyDays.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {DAY_LABELS.map((label, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] w-4 h-4 rounded flex items-center justify-center ${
                              habit.weeklyDays!.includes(idx) ? 'bg-primary/30 text-primary-light' : 'text-text-muted'
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-sub">
                      {streak > 0 && <span className="text-warning">{streak}日連続</span>}
                      <span>30日間: {rate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(habit)} className="p-2 text-text-sub hover:text-text">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(habit.id)} className="p-2 text-text-sub hover:text-danger">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Template Picker */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowTemplates(false)}>
          <div className="bg-surface w-full rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">テンプレートから追加</h3>
            <div className="space-y-2">
              {TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(t)}
                  className="w-full bg-surface-light rounded-xl p-3 flex items-center gap-3 text-left"
                >
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: CATEGORY_COLORS[t.category] + '22', color: CATEGORY_COLORS[t.category] }}
                  >
                    {t.category}
                  </span>
                  <span className="flex-1 text-sm font-medium">{t.name}</span>
                  {t.targetValue && t.targetUnit && (
                    <span className="text-xs text-text-sub">{t.targetValue}{t.targetUnit}</span>
                  )}
                  <span className="text-xs text-text-sub">{t.timeOfDay}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplates(false)} className="w-full mt-4 py-2.5 rounded-lg bg-surface-light text-sm">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <HabitForm
          initial={formInitial}
          isEditing={!!editingId}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-8" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-surface rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">習慣を削除</h3>
            <p className="text-sm text-text-sub mb-4">
              「{habits.find(h => h.id === deleteConfirm)?.name}」を削除しますか？記録も全て削除されます。
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg bg-surface-light text-sm">
                キャンセル
              </button>
              <button
                onClick={() => { deleteHabit(deleteConfirm); setDeleteConfirm(null) }}
                className="flex-1 py-2.5 rounded-lg bg-danger text-white text-sm font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
