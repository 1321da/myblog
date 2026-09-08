import Link from 'next/link';

export default function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-gray-50"
        >
          上一页
        </Link>
      ) : (
        <span className="rounded-md border border-border px-4 py-2 text-sm text-gray-300">
          上一页
        </span>
      )}
      <span className="text-sm text-muted">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-gray-50"
        >
          下一页
        </Link>
      ) : (
        <span className="rounded-md border border-border px-4 py-2 text-sm text-gray-300">
          下一页
        </span>
      )}
    </nav>
  );
}
