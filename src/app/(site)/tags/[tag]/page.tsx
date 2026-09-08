import { getPublishedPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total } = getPublishedPosts(page, PAGE_SIZE, decoded);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">标签：{decoded}</h1>
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted">该标签下暂无文章。</div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={(p) => `/tags/${encodeURIComponent(decoded)}?page=${p}`}
      />
    </div>
  );
}
