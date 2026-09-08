import PostForm from '@/components/PostForm';

export const metadata = { title: '新建文章' };

export default function NewPostPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">新建文章</h1>
      <PostForm />
    </div>
  );
}
