import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUserByUsername } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

const schema = z.object({
  username: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码'),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '请输入账号和密码' }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const user = getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
  }

  await setSessionCookie(user.username);
  return NextResponse.json({ ok: true });
}
