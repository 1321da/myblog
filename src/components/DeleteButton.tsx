'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm('确定删除这篇文章吗？此操作不可恢复。')) return;
    setLoading(true);
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? '删除中…' : '删除'}
    </button>
  );
}
