import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSessionUser())) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/admin" className="font-bold">
            博客管理
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/admin" className="hover:text-foreground">
              仪表盘
            </Link>
            <Link href="/admin/posts" className="hover:text-foreground">
              文章
            </Link>
            <Link href="/admin/about" className="hover:text-foreground">
              关于我
            </Link>
            <Link href="/" target="_blank" className="hover:text-foreground">
              查看站点 ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
