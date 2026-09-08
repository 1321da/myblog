'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AboutFormProps {
  initial: {
    avatar: string;
    bio: string;
    contact: string;
    social_links: string; // JSON 数组字符串
  };
}

function socialLinksToText(json: string): string {
  try {
    const arr = JSON.parse(json) as { label: string; url: string }[];
    if (!Array.isArray(arr)) return '';
    return arr.map((s) => `${s.label}|${s.url}`).join('\n');
  } catch {
    return '';
  }
}

export default function AboutForm({ initial }: AboutFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const socialText = String(fd.get('social_links') ?? '');
    const social = socialText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf('|');
        if (i === -1) return { label: line, url: '' };
        return { label: line.slice(0, i).trim(), url: line.slice(i + 1).trim() };
      });

    const res = await fetch('/api/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatar: fd.get('avatar'),
        bio: fd.get('bio'),
        contact: fd.get('contact'),
        social_links: JSON.stringify(social),
      }),
    });
    if (res.ok) {
      router.push('/admin');
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
        <label className="mb-1 block text-sm font-medium">头像 URL</label>
        <input name="avatar" defaultValue={initial.avatar} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">个人简介（Markdown）</label>
        <textarea name="bio" rows={5} defaultValue={initial.bio} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">联系方式</label>
        <input name="contact" defaultValue={initial.contact} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          社交链接（每行一条，格式：名称|链接）
        </label>
        <textarea
          name="social_links"
          rows={4}
          defaultValue={socialLinksToText(initial.social_links)}
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
          {loading ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-md border border-border px-4 py-2 hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </form>
  );
}
