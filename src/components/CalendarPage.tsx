import { useState } from 'react'
import { useApp } from '../context'
import { formatDate, getDaysInMonth, getFirstDayOfMonth, getStreak } from '../utils'

export default function CalendarPage() {
  const { habits, recordMap, getRecord, toggleRecord } = useApp()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedHabit, setSelectedHabit] = useState<string | null>(habits[0]?.id || null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const weekLabels = ['日', '月', '火', '水', '木', '金', '土']

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const todayStr = formatDate(new Date())

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const habit = habits.find(h => h.id === selectedHabit)
  const streak = habit ? getStreak(habit, recordMap) : 0

  const completedThisMonth = selectedHabit
    ? Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = formatDate(new Date(year, month, i + 1))
        return getRecord(selectedHabit, dateStr)?.completed ? 1 : 0
      }).reduce((a: number, b: number) => a + b, 0)
    : 0

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">カレンダー</h1>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-text-sub">
          <p>習慣を追加してください</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {habits.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHabit(h.id)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                  selectedHabit === h.id ? 'text-white font-medium' : 'bg-surface-light text-text-sub'
                }`}
                style={selectedHabit === h.id ? { backgroundColor: h.color } : {}}
              >
                {h.name}
              </button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mb-4">
            <div className="bg-surface rounded-xl p-3 flex-1 text-center">
              <p className="text-2xl font-bold text-warning">{streak}</p>
              <p className="text-[10px] text-text-sub">連続日数</p>
            </div>
            <div className="bg-surface rounded-xl p-3 flex-1 text-center">
              <p className="text-2xl font-bold text-success">{completedThisMonth}</p>
              <p className="text-[10px] text-text-sub">今月の達成</p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 text-text-sub hover:text-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold">{year}年 {month + 1}月</span>
            <button onClick={nextMonth} className="p-2 text-text-sub hover:text-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {weekLabels.map(w => (
              <div key={w} className="text-center text-[10px] text-text-sub py-1">{w}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const dateStr = formatDate(new Date(year, month, day))
              const isToday = dateStr === todayStr
              const done = selectedHabit ? getRecord(selectedHabit, dateStr)?.completed : false
              const isFuture = dateStr > todayStr
              return (
                <button
                  key={i}
                  onClick={() => selectedHabit && !isFuture && toggleRecord(selectedHabit, dateStr)}
                  disabled={isFuture}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm relative transition-all ${
                    isFuture ? 'text-text-muted' :
                    done ? 'text-white font-medium' :
                    'text-text hover:bg-surface-light'
                  } ${isToday ? 'ring-1 ring-primary' : ''}`}
                  style={done ? { backgroundColor: habit?.color || '#6366f1' } : {}}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
