import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: '登录' };

export default async function LoginPage() {
  if (await getSessionUser()) {
    redirect('/admin');
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold">博主登录</h1>
        <LoginForm />
      </div>
    </div>
  );
}
