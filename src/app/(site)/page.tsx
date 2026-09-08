import { getPublishedPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total } = await getPublishedPosts(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted">还没有文章，敬请期待。</div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={(p) => `/?page=${p}`}
      />
    </div>
  );
}
