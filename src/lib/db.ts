import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export type PostStatus = 'published' | 'draft';

export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  tags: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AboutData {
  avatar: string;
  bio: string;
  contact: string;
  social_links: string; // JSON 数组字符串
  updated_at: string;
}

export interface Stats {
  total: number;
  published: number;
  draft: number;
  monthNew: number;
}

export interface PostInput {
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  tags: string;
  status: PostStatus;
}

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'blog.db');
const db = new DatabaseSync(dbPath);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS about (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  avatar TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  social_links TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

function asPost(row: unknown): Post {
  return row as Post;
}

export function getPublishedPosts(
  page = 1,
  pageSize = 10,
  tag?: string,
): { posts: Post[]; total: number } {
  const conditions: string[] = ["status = 'published'"];
  const params: string[] = [];

  if (tag) {
    conditions.push("(',' || tags || ',') LIKE ?");
    params.push(`%,${tag},%`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const { c } = db.prepare(`SELECT COUNT(*) AS c FROM posts ${where}`).get(...params) as { c: number };
  const total = Number(c);

  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(
      `SELECT * FROM posts ${where}
       ORDER BY COALESCE(published_at, created_at) DESC, id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset);

  return { posts: rows.map(asPost), total };
}

export function getAdminPosts(
  page = 1,
  pageSize = 10,
  q?: string,
  status?: PostStatus | '',
): { posts: Post[]; total: number } {
  const conditions: string[] = [];
  const params: string[] = [];

  if (q) {
    conditions.push('title LIKE ?');
    params.push(`%${q}%`);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { c } = db.prepare(`SELECT COUNT(*) AS c FROM posts ${where}`).get(...params) as { c: number };
  const total = Number(c);

  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(`SELECT * FROM posts ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  return { posts: rows.map(asPost), total };
}

export function getPostBySlug(slug: string): Post | null {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  return row ? asPost(row) : null;
}

export function getPostById(id: number): Post | null {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  return row ? asPost(row) : null;
}

export function createPost(input: PostInput): Post {
  const publishedAt = input.status === 'published' ? new Date().toISOString() : null;
  const result = db
    .prepare(
      `INSERT INTO posts (slug, title, summary, content, tags, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug,
      input.title,
      input.summary,
      input.content,
      input.tags,
      input.status,
      publishedAt,
    );
  const id = Number(result.lastInsertRowid);
  return getPostById(id)!;
}

export function updatePost(id: number, input: PostInput): Post | null {
  const existing = getPostById(id);
  if (!existing) return null;

  let publishedAt = existing.published_at;
  if (input.status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  } else if (input.status === 'draft') {
    publishedAt = null;
  }

  db.prepare(
    `UPDATE posts
     SET slug = ?, title = ?, summary = ?, content = ?, tags = ?, status = ?, published_at = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    input.slug,
    input.title,
    input.summary,
    input.content,
    input.tags,
    input.status,
    publishedAt,
    id,
  );
  return getPostById(id);
}

export function deletePost(id: number): void {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

export function getStats(): Stats {
  const total = Number((db.prepare('SELECT COUNT(*) AS c FROM posts').get() as { c: number }).c);
  const published = Number(
    (db.prepare("SELECT COUNT(*) AS c FROM posts WHERE status = 'published'").get() as { c: number }).c,
  );
  const draft = Number(
    (db.prepare("SELECT COUNT(*) AS c FROM posts WHERE status = 'draft'").get() as { c: number }).c,
  );
  const monthNew = Number(
    (
      db
        .prepare(
          "SELECT COUNT(*) AS c FROM posts WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
        )
        .get() as { c: number }
    ).c,
  );
  return { total, published, draft, monthNew };
}

export function getAbout(): AboutData {
  let row = db.prepare('SELECT * FROM about WHERE id = 1').get() as unknown as AboutData | undefined;
  if (!row) {
    db.prepare('INSERT INTO about (id) VALUES (1)').run();
    row = db.prepare('SELECT * FROM about WHERE id = 1').get() as unknown as AboutData;
  }
  return row;
}

export function updateAbout(input: {
  avatar: string;
  bio: string;
  contact: string;
  social_links: string;
}): AboutData {
  db.prepare(
    `INSERT INTO about (id, avatar, bio, contact, social_links, updated_at)
     VALUES (1, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       avatar = excluded.avatar,
       bio = excluded.bio,
       contact = excluded.contact,
       social_links = excluded.social_links,
       updated_at = datetime('now')`,
  ).run(input.avatar, input.bio, input.contact, input.social_links);
  return getAbout();
}

export function getUserByUsername(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;
}

export function updateUserPassword(username: string, hash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
}

export default db;
