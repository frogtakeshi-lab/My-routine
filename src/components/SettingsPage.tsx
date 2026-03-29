import { useState, useRef } from 'react'
import { useApp } from '../context'
import { exportData, parseImportData } from '../storage'

export default function SettingsPage() {
  const { habits, records, theme, setTheme, importData, requestNotificationPermission } = useApp()
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingImport, setPendingImport] = useState<{ habits: any[]; records: any[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = exportData(habits, records)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-routine-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseImportData(text)
      if (parsed) {
        setPendingImport(parsed)
        setShowImportConfirm(true)
      } else {
        setImportStatus('error')
        setTimeout(() => setImportStatus('idle'), 3000)
      }
    }
    reader.readAsText(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const confirmImport = () => {
    if (pendingImport) {
      importData(pendingImport.habits, pendingImport.records)
      setImportStatus('success')
      setTimeout(() => setImportStatus('idle'), 3000)
    }
    setShowImportConfirm(false)
    setPendingImport(null)
  }

  const notifSupported = 'Notification' in window
  const notifStatus = notifSupported ? Notification.permission : 'unsupported'

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      {/* Theme */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">テーマ</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              theme === 'dark' ? 'bg-primary text-white' : 'bg-surface-light text-text-sub'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            ダーク
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              theme === 'light' ? 'bg-primary text-white' : 'bg-surface-light text-text-sub'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            ライト
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">通知</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">ブラウザ通知</p>
            <p className="text-xs text-text-sub mt-0.5">
              {notifStatus === 'granted' ? '許可済み' :
               notifStatus === 'denied' ? 'ブロック中（ブラウザ設定から変更）' :
               notifStatus === 'unsupported' ? '非対応ブラウザ' : '未設定'}
            </p>
          </div>
          {notifSupported && notifStatus === 'default' && (
            <button
              onClick={requestNotificationPermission}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              許可する
            </button>
          )}
          {notifStatus === 'granted' && (
            <span className="text-success text-sm">ON</span>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">データ管理</h2>

        <div className="space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full bg-surface-light rounded-xl p-3 flex items-center gap-3 text-left"
          >
            <svg className="w-5 h-5 text-primary-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div>
              <p className="text-sm font-medium">データをエクスポート</p>
              <p className="text-xs text-text-sub">JSONファイルとしてバックアップ</p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-surface-light rounded-xl p-3 flex items-center gap-3 text-left"
          >
            <svg className="w-5 h-5 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <div>
              <p className="text-sm font-medium">データをインポート</p>
              <p className="text-xs text-text-sub">バックアップから復元</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          {importStatus === 'success' && (
            <p className="text-sm text-success text-center">インポートに成功しました</p>
          )}
          {importStatus === 'error' && (
            <p className="text-sm text-danger text-center">ファイルの形式が正しくありません</p>
          )}
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">データサマリー</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-light">{habits.length}</p>
            <p className="text-xs text-text-sub">登録習慣</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{records.filter(r => r.completed).length}</p>
            <p className="text-xs text-text-sub">達成記録</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{records.filter(r => r.memo).length}</p>
            <p className="text-xs text-text-sub">メモ数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-sub">
              {records.length > 0 ? records.reduce((min, r) => r.date < min ? r.date : min, records[0].date).slice(5) : '-'}
            </p>
            <p className="text-xs text-text-sub">最古の記録</p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-surface rounded-xl p-4">
        <h2 className="font-semibold mb-2">アプリ情報</h2>
        <p className="text-sm text-text-sub">My Routine v1.0.0</p>
        <p className="text-xs text-text-muted mt-1">習慣管理アプリ - React + Tailwind CSS</p>
      </div>

      {/* Import Confirmation Modal */}
      {showImportConfirm && pendingImport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-8" onClick={() => setShowImportConfirm(false)}>
          <div className="bg-surface rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">データをインポート</h3>
            <p className="text-sm text-text-sub mb-2">
              現在のデータが上書きされます。よろしいですか？
            </p>
            <p className="text-xs text-text-muted mb-4">
              インポート内容: 習慣 {pendingImport.habits.length}件、記録 {pendingImport.records.length}件
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowImportConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-surface-light text-sm">
                キャンセル
              </button>
              <button onClick={confirmImport} className="flex-1 py-2.5 rounded-lg bg-warning text-white text-sm font-medium">
                インポート
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
