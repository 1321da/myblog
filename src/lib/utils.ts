/** 由标题生成 URL slug（仅保留 ASCII；中文等会返回空，交由调用方回退） */
export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || `post-${Date.now().toString(36)}`;
}

/** 从 Markdown 正文提取纯文本摘要（前 max 字） */
export function makeSummary(content: string, max = 100): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

/** 逗号分隔字符串 → 数组 */
export function parseTags(tags: string): string[] {
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 数组 → 逗号分隔字符串 */
export function formatTags(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .join(',');
}

function normalizeDate(s: string): Date {
  // SQLite datetime('now') 生成 "YYYY-MM-DD HH:MM:SS"（UTC），补上时区标记
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    return new Date(`${s.replace(' ', 'T')}Z`);
  }
  return new Date(s);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = normalizeDate(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
