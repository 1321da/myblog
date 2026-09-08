import Link from 'next/link';
import { getAdminPosts } from '@/lib/db';
import Pagination from '@/components/Pagination';
import DeleteButton from '@/components/DeleteButton';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: '文章管理' };

const PAGE_SIZE = 10;

function buildQuery(params: Record<string, string>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q ?? '';
  const status = sp.status === 'published' || sp.status === 'draft' ? sp.status : '';

  const { posts, total } = await getAdminPosts(page, PAGE_SIZE, q || undefined, status || undefined);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
        >
          + 新建文章
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="按标题搜索"
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-gray-50"
        >
          搜索
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">发布时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(p.published_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/posts/${p.id}/edit`} className="text-accent hover:underline">
                      编辑
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {posts.length === 0 && <p className="py-10 text-center text-muted">没有匹配的文章。</p>}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={(p) => `/admin/posts${buildQuery({ page: String(p), q, status })}`}
      />
    </div>
  );
}
