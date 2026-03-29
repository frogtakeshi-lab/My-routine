import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context'
import { todayStr, getStreak, isHabitDueToday, CATEGORY_COLORS } from '../utils'

function ConfettiEffect({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 900)
    return () => clearTimeout(timer)
  }, [onDone])

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 20 + Math.random() * 60,
    delay: Math.random() * 0.3,
    color: ['#22c55e', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#14b8a6'][i % 6],
    size: 4 + Math.random() * 4,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti rounded-full"
          style={{
            left: `${p.left}%`,
            top: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function TodayPage() {
  const { habits, recordMap, toggleRecord, getRecord, updateMemo, updateRecordValue, requestNotificationPermission } = useApp()
  const today = todayStr()
  const dueHabits = habits.filter(isHabitDueToday).sort((a, b) => (a.priority || 'B').localeCompare(b.priority || 'B'))
  const completedCount = dueHabits.filter(h => getRecord(h.id, today)?.completed).length
  const [memoTarget, setMemoTarget] = useState<string | null>(null)
  const [memoText, setMemoText] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrateId, setCelebrateId] = useState<string | null>(null)
  const [notifRequested, setNotifRequested] = useState(false)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'おはよう' : now.getHours() < 18 ? 'こんにちは' : 'おつかれさま'
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${'日月火水木金土'[now.getDay()]}）`

  const progress = dueHabits.length > 0 ? Math.round((completedCount / dueHabits.length) * 100) : 0

  useEffect(() => {
    if (!notifRequested && habits.some(h => h.reminderTime)) {
      requestNotificationPermission()
      setNotifRequested(true)
    }
  }, [habits, notifRequested, requestNotificationPermission])

  const handleToggle = useCallback((habitId: string) => {
    const rec = getRecord(habitId, today)
    const wasCompleted = rec?.completed || false
    toggleRecord(habitId)

    if (!wasCompleted) {
      setCelebrateId(habitId)
      setTimeout(() => setCelebrateId(null), 500)
      if (completedCount + 1 >= dueHabits.length) {
        setShowConfetti(true)
      }
    }
  }, [getRecord, today, toggleRecord, completedCount, dueHabits.length])

  const openMemo = (habitId: string) => {
    const rec = getRecord(habitId, today)
    setMemoText(rec?.memo || '')
    setMemoTarget(habitId)
  }

  const saveMemo = () => {
    if (memoTarget) {
      updateMemo(memoTarget, today, memoText)
      setMemoTarget(null)
    }
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {showConfetti && <ConfettiEffect onDone={() => setShowConfetti(false)} />}

      <div className="mb-6">
        <p className="text-text-sub text-sm">{dateLabel}</p>
        <h1 className="text-2xl font-bold mt-1">{greeting}!</h1>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center gap-4 bg-surface rounded-2xl p-4 mb-6">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" className="stroke-surface-light" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke={progress === 100 ? '#22c55e' : '#6366f1'}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${progress * 0.88} 88`}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {progress}%
          </span>
        </div>
        <div>
          <p className="text-lg font-semibold">{completedCount} / {dueHabits.length}</p>
          <p className="text-text-sub text-sm">
            {progress === 100 ? 'パーフェクト!' : progress >= 50 ? 'いい調子!' : 'がんばろう!'}
          </p>
        </div>
      </div>

      {/* Habit List */}
      {dueHabits.length === 0 ? (
        <div className="text-center py-16 text-text-sub">
          <p className="text-lg mb-2">まだ習慣がありません</p>
          <p className="text-sm">「習慣」タブから追加しましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dueHabits.map(habit => {
            const rec = getRecord(habit.id, today)
            const done = rec?.completed || false
            const streak = getStreak(habit, recordMap)
            const isCelebrating = celebrateId === habit.id
            return (
              <div
                key={habit.id}
                className={`bg-surface rounded-xl p-4 transition-all ${done ? 'opacity-70' : ''} ${isCelebrating ? 'animate-celebrate' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      done ? 'bg-success border-success' : 'border-border'
                    }`}
                    style={done ? {} : { borderColor: habit.color }}
                  >
                    {done && (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path className={isCelebrating ? 'animate-check' : ''} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${done ? 'line-through text-text-sub' : ''}`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
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
                      <span className="text-[10px] text-text-sub">{habit.timeOfDay}</span>
                      {streak > 0 && <span className="text-[10px] text-warning font-medium">{streak}日連続</span>}
                      {rec?.memo && <span className="text-[10px] text-blue-400">memo</span>}
                    </div>
                  </div>
                  <button onClick={() => openMemo(habit.id)} className="text-text-sub p-1.5 hover:text-text transition-colors" title="メモ">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </button>
                </div>

                {/* Numeric target progress */}
                {habit.targetValue && habit.targetUnit && (
                  <div className="mt-2 ml-[52px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={rec?.value || ''}
                        onChange={e => updateRecordValue(habit.id, today, Number(e.target.value))}
                        placeholder="0"
                        className="w-16 bg-surface-light rounded-lg px-2 py-1 text-xs text-center outline-none"
                      />
                      <span className="text-xs text-text-sub">/ {habit.targetValue}{habit.targetUnit}</span>
                      <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((rec?.value || 0) / habit.targetValue) * 100)}%`,
                            backgroundColor: (rec?.value || 0) >= habit.targetValue ? '#22c55e' : habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Memo Modal */}
      {memoTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setMemoTarget(null)}>
          <div className="bg-surface w-full rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">
              {habits.find(h => h.id === memoTarget)?.name} - メモ
            </h3>
            <textarea
              value={memoText}
              onChange={e => setMemoText(e.target.value)}
              placeholder="今日の振り返りを書こう..."
              className="w-full bg-surface-light rounded-lg p-3 text-sm resize-none h-24 outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setMemoTarget(null)} className="flex-1 py-2.5 rounded-lg bg-surface-light text-sm">
                キャンセル
              </button>
              <button onClick={saveMemo} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
