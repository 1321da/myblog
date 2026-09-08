import { getAbout } from '@/lib/db';
import AboutForm from '@/components/AboutForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: '关于我管理' };

export default async function AdminAboutPage() {
  const about = await getAbout();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">关于我管理</h1>
      <AboutForm
        initial={{
          avatar: about.avatar,
          bio: about.bio,
          contact: about.contact,
          social_links: about.social_links,
        }}
      />
    </div>
  );
}
