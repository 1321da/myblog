import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePost, deletePost, getPostById } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { makeSummary } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().min(1, 'slug 不能为空'),
  summary: z.string().optional(),
  content: z.string().min(1, '正文不能为空'),
  tags: z.string().optional(),
  status: z.enum(['published', 'draft']),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
  }
  if (!getPostById(postId)) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? '参数错误' },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const summary = d.summary?.trim() ? d.summary.trim() : makeSummary(d.content);
  const post = updatePost(postId, {
    slug: d.slug.trim(),
    title: d.title.trim(),
    summary,
    content: d.content,
    tags: d.tags?.trim() ?? '',
    status: d.status,
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
  }

  deletePost(postId);
  return NextResponse.json({ ok: true });
}
