import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPost, getPostBySlug } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { slugify, makeSummary } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().min(1, '正文不能为空'),
  tags: z.string().optional(),
  status: z.enum(['published', 'draft']).default('draft'),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
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
  let slug = (d.slug?.trim() || slugify(d.title)).replace(/\s+/g, '-');
  let finalSlug = slug;
  let i = 2;
  while (await getPostBySlug(finalSlug)) {
    finalSlug = `${slug}-${i++}`;
  }

  const summary = d.summary?.trim() ? d.summary.trim() : makeSummary(d.content);
  const post = await createPost({
    slug: finalSlug,
    title: d.title.trim(),
    summary,
    content: d.content,
    tags: d.tags?.trim() ?? '',
    status: d.status,
  });

  return NextResponse.json({ post }, { status: 201 });
}
