'use client';

import { useState } from 'react';
import type { Routine } from '@/types';
import { useRoutines } from '@/hooks/useRoutines';
import { RoutineListItem } from '@/components/routine/RoutineListItem';
import { RoutineForm } from '@/components/routine/RoutineForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ManagePage() {
  const { routines, addRoutine, updateRoutine, deleteRoutine, toggleEnabled } = useRoutines();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

  function handleEdit(routine: Routine) {
    setEditing(routine);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSubmit(data: Omit<Routine, 'id' | 'createdAt'>) {
    if (editing) {
      updateRoutine({ ...editing, ...data });
    } else {
      addRoutine(data);
    }
    handleClose();
  }

  function handleDelete(id: string) {
    if (window.confirm('このルーティンを削除しますか？')) {
      deleteRoutine(id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ルーティン管理</h1>
        <Button onClick={handleAdd} size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          追加
        </Button>
      </div>

      {routines.length === 0 ? (
        <EmptyState
          title="ルーティンがまだありません"
          description="追加ボタンからルーティンを登録しましょう！"
        />
      ) : (
        <div className="space-y-2">
          {routines.map((routine) => (
            <RoutineListItem
              key={routine.id}
              routine={routine}
              onEdit={() => handleEdit(routine)}
              onDelete={() => handleDelete(routine.id)}
              onToggleEnabled={() => toggleEnabled(routine.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editing ? 'ルーティンを編集' : 'ルーティンを追加'}
      >
        <RoutineForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
