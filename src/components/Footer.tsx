export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-3xl px-4 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} 我的博客 · Powered by Next.js
      </div>
    </footer>
  );
}
