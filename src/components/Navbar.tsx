import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          我的博客
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            首页
          </Link>
          <Link href="/about" className="hover:text-foreground">
            关于
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
