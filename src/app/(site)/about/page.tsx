import { getAbout } from '@/lib/db';
import Markdown from '@/components/Markdown';

export const dynamic = 'force-dynamic';

export const metadata = { title: '关于我' };

export default function AboutPage() {
  const about = getAbout();

  let socials: { label: string; url: string }[] = [];
  try {
    const parsed = JSON.parse(about.social_links);
    if (Array.isArray(parsed)) socials = parsed;
  } catch {
    socials = [];
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">关于我</h1>
      {about.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={about.avatar}
          alt="头像"
          className="h-24 w-24 rounded-full border border-border object-cover"
        />
      ) : null}
      <div className="mt-6">
        <Markdown content={about.bio} />
      </div>
      {about.contact ? <p className="mt-4 text-muted">联系方式：{about.contact}</p> : null}
      {socials.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
