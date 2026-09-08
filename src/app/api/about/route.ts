import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateAbout } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

const schema = z.object({
  avatar: z.string().default(''),
  bio: z.string().default(''),
  contact: z.string().default(''),
  social_links: z.string().default('[]'),
});

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});
  const d = parsed.success
    ? parsed.data
    : { avatar: '', bio: '', contact: '', social_links: '[]' };

  const about = updateAbout({
    avatar: d.avatar,
    bio: d.bio,
    contact: d.contact,
    social_links: d.social_links,
  });

  return NextResponse.json({ about });
}
