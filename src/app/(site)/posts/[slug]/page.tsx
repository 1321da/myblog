import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPublishedPosts } from '@/lib/db';
import Markdown from '@/components/Markdown';
import { parseTags, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') {
    return { title: '文章不存在' };
  }
  return { title: post.title, description: post.summary ?? undefined };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== 'published') notFound();

  const { posts } = await getPublishedPosts(1, 100000);
  const idx = posts.findIndex((p) => p.id === post.id);
  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

  const tags = parseTags(post.tags);

  return (
    <article>
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <time>{formatDate(post.published_at)}</time>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
            >
              #{t}
            </Link>
          ))}
        </div>
      </header>

      <Markdown content={post.content} />

      <nav className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <div className="text-sm">
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="group block">
              <span className="text-muted">上一篇</span>
              <span className="block truncate font-medium group-hover:text-accent">
                {prev.title}
              </span>
            </Link>
          ) : null}
        </div>
        <div className="text-sm sm:text-right">
          {next ? (
            <Link href={`/posts/${next.slug}`} className="group block">
              <span className="text-muted">下一篇</span>
              <span className="block truncate font-medium group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : null}
        </div>
      </nav>

      <div className="mt-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 返回首页
        </Link>
      </div>
    </article>
  );
}
