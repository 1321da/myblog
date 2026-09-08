import Link from 'next/link';
import { getStats, getAdminPosts } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: '仪表盘' };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = getStats();
  const { posts } = getAdminPosts(1, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="文章总数" value={stats.total} />
        <StatCard label="已发布" value={stats.published} />
        <StatCard label="草稿" value={stats.draft} />
        <StatCard label="本月新增" value={stats.monthNew} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近文章</h2>
          <Link href="/admin/posts" className="text-sm text-accent hover:underline">
            查看全部 →
          </Link>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {posts.length === 0 ? (
            <li className="p-4 text-muted">还没有文章。</li>
          ) : (
            posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-4">
                <Link href={`/admin/posts/${p.id}/edit`} className="truncate hover:text-accent">
                  {p.title}
                </Link>
                <span className="ml-4 shrink-0 text-sm text-muted">
                  {formatDate(p.published_at ?? p.created_at)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
