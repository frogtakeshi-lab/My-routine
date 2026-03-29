import { useState } from 'react'
import { useApp } from '../context'
import type { Habit, DayRecord, RecordMap } from '../types'
import { getStreak, getCompletionRate, formatDate, isHabitDueOnDate, CATEGORY_COLORS } from '../utils'

type Tab = 'stats' | 'review'

export default function StatsPage() {
  const { habits, records, recordMap } = useApp()
  const [tab, setTab] = useState<Tab>('stats')

  if (habits.length === 0) {
    return (
      <div className="px-4 pt-6 pb-24">
        <h1 className="text-2xl font-bold mb-4">統計</h1>
        <div className="text-center py-16 text-text-sub">
          <p>習慣を追加するとここに統計が表示されます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-surface-light rounded-xl p-1 mb-6">
        {(['stats', 'review'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-primary text-white' : 'text-text-sub'
            }`}
          >
            {t === 'stats' ? '統計' : 'レビュー'}
          </button>
        ))}
      </div>

      {tab === 'stats' ? (
        <StatsView habits={habits} records={records} recordMap={recordMap} />
      ) : (
        <ReviewView habits={habits} records={records} recordMap={recordMap} />
      )}
    </div>
  )
}

function StatsView({ habits, recordMap }: { habits: Habit[]; records: DayRecord[]; recordMap: RecordMap }) {
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return formatDate(d)
  })

  const weeklyData = last7.map(date => {
    const d = new Date(date + 'T00:00:00')
    const dueHabits = habits.filter(h => isHabitDueOnDate(h, d))
    const done = dueHabits.filter(h => recordMap.get(`${h.id}:${date}`)?.completed).length
    const total = dueHabits.length
    return { date, done, total, rate: total > 0 ? Math.round((done / total) * 100) : 0 }
  })

  const overallRate7 = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h, recordMap, 7), 0) / habits.length)
    : 0

  const overallRate30 = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h, recordMap, 30), 0) / habits.length)
    : 0

  const maxStreak = Math.max(...habits.map(h => getStreak(h, recordMap)), 0)
  const dayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  }

  const categories = [...new Set(habits.map(h => h.category))]
  const categoryStats = categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat)
    const avgRate = Math.round(
      catHabits.reduce((sum, h) => sum + getCompletionRate(h, recordMap, 30), 0) / catHabits.length
    )
    return { category: cat, count: catHabits.length, rate: avgRate }
  })

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">統計</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary-light">{overallRate7}%</p>
          <p className="text-xs text-text-sub mt-1">7日間達成率</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary-light">{overallRate30}%</p>
          <p className="text-xs text-text-sub mt-1">30日間達成率</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-warning">{maxStreak}</p>
          <p className="text-xs text-text-sub mt-1">最長ストリーク</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-success">{habits.length}</p>
          <p className="text-xs text-text-sub mt-1">登録習慣数</p>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="bg-surface rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3">週間達成率</h2>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-text-sub">{d.rate}%</span>
              <div className="w-full bg-surface-light rounded-t-sm relative" style={{ height: '100px' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${d.rate}%`,
                    backgroundColor: d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#f59e0b' : '#6366f1',
                  }}
                />
              </div>
              <span className="text-[10px] text-text-sub">{dayLabel(d.date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-surface rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3">カテゴリ別</h2>
        <div className="space-y-3">
          {categoryStats.map(cs => (
            <div key={cs.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: CATEGORY_COLORS[cs.category] }}>
                  {cs.category} ({cs.count})
                </span>
                <span className="text-sm text-text-sub">{cs.rate}%</span>
              </div>
              <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cs.rate}%`, backgroundColor: CATEGORY_COLORS[cs.category] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Habit Rankings */}
      <div className="bg-surface rounded-xl p-4">
        <h2 className="font-semibold mb-3">習慣ランキング (30日)</h2>
        <div className="space-y-2">
          {habits
            .map(h => ({ habit: h, rate: getCompletionRate(h, recordMap, 30), streak: getStreak(h, recordMap) }))
            .sort((a, b) => b.rate - a.rate)
            .map(({ habit, rate, streak }, i) => (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-muted w-5">{i + 1}</span>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                <span className="text-sm flex-1 truncate">{habit.name}</span>
                {streak > 0 && <span className="text-[10px] text-warning">{streak}日</span>}
                <span className="text-sm font-medium" style={{
                  color: rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {rate}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

function ReviewView({ habits, records, recordMap }: { habits: Habit[]; records: DayRecord[]; recordMap: RecordMap }) {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const today = new Date()

  // This week: Mon-Sun
  const thisWeekStart = new Date(today)
  const dayOfWeek = today.getDay()
  thisWeekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  // This month
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  function getRangeRate(start: Date, end: Date) {
    if (habits.length === 0) return 0
    let totalDue = 0
    let totalDone = 0
    for (const h of habits) {
      const d = new Date(start)
      while (d <= end) {
        if (isHabitDueOnDate(h, d)) {
          totalDue++
          const dateStr = formatDate(d)
          if (recordMap.get(`${h.id}:${dateStr}`)?.completed) totalDone++
        }
        d.setDate(d.getDate() + 1)
      }
    }
    return totalDue > 0 ? Math.round((totalDone / totalDue) * 100) : 0
  }

  function getHabitRangeRate(habit: typeof habits[0], start: Date, end: Date) {
    let due = 0
    let done = 0
    const d = new Date(start)
    while (d <= end) {
      if (isHabitDueOnDate(habit, d)) {
        due++
        if (recordMap.get(`${habit.id}:${formatDate(d)}`)?.completed) done++
      }
      d.setDate(d.getDate() + 1)
    }
    return { due, done, rate: due > 0 ? Math.round((done / due) * 100) : 0 }
  }

  const isWeek = period === 'week'
  const currentStart = isWeek ? thisWeekStart : thisMonthStart
  const currentEnd = today
  const prevStart = isWeek ? lastWeekStart : lastMonthStart
  const prevEnd = isWeek ? new Date(thisWeekStart.getTime() - 86400000) : lastMonthEnd

  const currentRate = getRangeRate(currentStart, currentEnd)
  const prevRate = getRangeRate(prevStart, prevEnd)
  const diff = currentRate - prevRate

  // Per-habit comparison
  const habitComparisons = habits.map(h => {
    const current = getHabitRangeRate(h, currentStart, currentEnd)
    const prev = getHabitRangeRate(h, prevStart, prevEnd)
    return {
      habit: h,
      currentRate: current.rate,
      currentDone: current.done,
      currentDue: current.due,
      prevRate: prev.rate,
      diff: current.rate - prev.rate,
      streak: getStreak(h, recordMap),
    }
  }).sort((a, b) => b.currentRate - a.currentRate)

  // Memos in range
  const memos = records
    .filter(r => {
      if (!r.memo) return false
      return r.date >= formatDate(currentStart) && r.date <= formatDate(currentEnd)
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  const periodLabel = isWeek ? '今週' : '今月'
  const prevLabel = isWeek ? '先週' : '先月'

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">レビュー</h1>

      {/* Period Switcher */}
      <div className="flex gap-1 bg-surface-light rounded-xl p-1 mb-6">
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            period === 'week' ? 'bg-surface text-text' : 'text-text-sub'
          }`}
        >
          週次
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            period === 'month' ? 'bg-surface text-text' : 'text-text-sub'
          }`}
        >
          月次
        </button>
      </div>

      {/* Overall Comparison */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">{periodLabel}の達成率</h2>
        <div className="flex items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-3xl font-bold text-primary-light">{currentRate}%</p>
            <p className="text-xs text-text-sub">{periodLabel}</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-text-sub'}`}>
              {diff > 0 ? '+' : ''}{diff}%
            </p>
            <p className="text-[10px] text-text-sub">vs {prevLabel}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-semibold text-text-sub">{prevRate}%</p>
            <p className="text-xs text-text-sub">{prevLabel}</p>
          </div>
        </div>
      </div>

      {/* Per-Habit Breakdown */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">習慣別パフォーマンス</h2>
        <div className="space-y-3">
          {habitComparisons.map(({ habit, currentRate: rate, currentDone, currentDue, diff: hDiff, streak }) => (
            <div key={habit.id}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                <span className="text-sm flex-1 truncate">{habit.name}</span>
                <span className="text-[10px] text-text-sub">{currentDone}/{currentDue}</span>
                <span className={`text-[10px] font-medium ${
                  hDiff > 0 ? 'text-success' : hDiff < 0 ? 'text-danger' : 'text-text-sub'
                }`}>
                  {hDiff > 0 ? '+' : ''}{hDiff}%
                </span>
                {streak > 0 && <span className="text-[10px] text-warning">{streak}日</span>}
              </div>
              <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Performers */}
      {habitComparisons.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-[10px] text-text-sub mb-1">ベスト習慣</p>
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: habitComparisons[0].habit.color }} />
            <p className="text-xs font-medium truncate">{habitComparisons[0].habit.name}</p>
            <p className="text-lg font-bold text-success">{habitComparisons[0].currentRate}%</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-[10px] text-text-sub mb-1">最大成長</p>
            {(() => {
              const best = [...habitComparisons].sort((a, b) => b.diff - a.diff)[0]
              return (
                <>
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: best.habit.color }} />
                  <p className="text-xs font-medium truncate">{best.habit.name}</p>
                  <p className={`text-lg font-bold ${best.diff >= 0 ? 'text-success' : 'text-danger'}`}>
                    {best.diff > 0 ? '+' : ''}{best.diff}%
                  </p>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Memos Timeline */}
      {memos.length > 0 && (
        <div className="bg-surface rounded-xl p-4">
          <h2 className="font-semibold mb-3">{periodLabel}のメモ</h2>
          <div className="space-y-2">
            {memos.map((r, i) => {
              const habit = habits.find(h => h.id === r.habitId)
              if (!habit) return null
              return (
                <div key={i} className="bg-surface-light rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                    <span className="text-xs font-medium">{habit.name}</span>
                    <span className="text-[10px] text-text-muted ml-auto">{r.date.slice(5)}</span>
                  </div>
                  <p className="text-sm text-text-sub">{r.memo}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
