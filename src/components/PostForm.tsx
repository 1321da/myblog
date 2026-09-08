'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PostFormProps {
  initial?: {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    tags: string;
    status: string;
  };
}

export default function PostForm({ initial }: PostFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get('title'),
      slug: fd.get('slug'),
      summary: fd.get('summary'),
      content: fd.get('content'),
      tags: fd.get('tags'),
      status: fd.get('status'),
    };
    const res = await fetch(isEdit ? `/api/posts/${initial!.id}` : '/api/posts', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/admin/posts');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || '保存失败');
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:outline-none';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">标题 *</label>
        <input name="title" required defaultValue={initial?.title} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          slug（网址标识，留空自动生成）
        </label>
        <input name="slug" defaultValue={initial?.slug} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">摘要（留空自动截取正文前 100 字）</label>
        <input name="summary" defaultValue={initial?.summary ?? ''} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">标签（逗号分隔）</label>
        <input name="tags" defaultValue={initial?.tags} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">状态</label>
        <select name="status" defaultValue={initial?.status ?? 'draft'} className={inputCls}>
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">正文（Markdown）*</label>
        <textarea
          name="content"
          required
          rows={16}
          defaultValue={initial?.content}
          className={`${inputCls} font-mono text-sm`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '保存中…' : isEdit ? '保存' : '创建'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/posts')}
          className="rounded-md border border-border px-4 py-2 hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
