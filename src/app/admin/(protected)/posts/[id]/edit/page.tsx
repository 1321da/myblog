import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/db';
import PostForm from '@/components/PostForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: '编辑文章' };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">编辑文章</h1>
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content,
          tags: post.tags,
          status: post.status,
        }}
      />
    </div>
  );
}
