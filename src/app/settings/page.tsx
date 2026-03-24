'use client';

import { useRoutines } from '@/hooks/useRoutines';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { removeItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

const permissionLabel: Record<NotificationPermission, string> = {
  granted: '許可済み',
  denied: '拒否済み',
  default: '未設定',
};

const permissionColor: Record<NotificationPermission, string> = {
  granted: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-600',
};

export default function SettingsPage() {
  const { routines } = useRoutines();
  const { permission, requestPermission } = useNotifications(routines);

  function handleClearData() {
    if (window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) {
      removeItem(STORAGE_KEYS.ROUTINES);
      removeItem(STORAGE_KEYS.LOGS);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">通知</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">通知の状態</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${permissionColor[permission]}`}>
            {permissionLabel[permission]}
          </span>
        </div>
        {permission !== 'granted' && permission !== 'denied' && (
          <Button onClick={requestPermission} size="sm" className="w-full">
            通知を許可する
          </Button>
        )}
        {permission === 'denied' && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            通知がブラウザ設定でブロックされています。ブラウザの設定からこのサイトの通知を許可してください。
          </p>
        )}
        {permission === 'granted' && (
          <p className="text-xs text-gray-500">
            リマインダー時刻が設定されているルーティンは、アプリを開いているときに通知が届きます。
          </p>
        )}
      </section>

      {/* Data */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">データ</h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>登録ルーティン数</span>
          <span className="font-medium">{routines.length} 件</span>
        </div>
        <Button variant="danger" size="sm" onClick={handleClearData} className="w-full">
          すべてのデータを削除
        </Button>
      </section>

      {/* About */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <h2 className="text-base font-semibold text-gray-800">アプリについて</h2>
        <p className="text-sm text-gray-500">My Routine v0.1.0</p>
        <p className="text-xs text-gray-400">データはこのデバイスのブラウザにのみ保存されます。</p>
      </section>
    </div>
  );
}
