import Link from 'next/link';
import type { Post } from '@/lib/db';
import { parseTags, formatDate } from '@/lib/utils';

export default function PostCard({ post }: { post: Post }) {
  const tags = parseTags(post.tags);
  return (
    <article className="group border-b border-border py-6 first:pt-0">
      <Link href={`/posts/${post.slug}`} className="block">
        <h2 className="text-xl font-semibold transition-colors group-hover:text-accent">
          {post.title}
        </h2>
      </Link>
      {post.summary ? (
        <p className="mt-2 text-muted line-clamp-2">{post.summary}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <time>{formatDate(post.published_at)}</time>
        {tags.length > 0 && (
          <span className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}`}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
              >
                #{t}
              </Link>
            ))}
          </span>
        )}
      </div>
    </article>
  );
}
