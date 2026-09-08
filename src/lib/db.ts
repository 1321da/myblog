import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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

function asPost(row: unknown): Post {
  return row as Post;
}

export async function getPublishedPosts(
  page = 1,
  pageSize = 10,
  tag?: string,
): Promise<{ posts: Post[]; total: number }> {
  const conditions: string[] = ["status = 'published'"];
  const values: unknown[] = [];
  if (tag) {
    values.push(tag);
    conditions.push(`(',' || tags || ',') LIKE '%' || $${values.length} || ',%'`);
  }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM posts ${where}`, values);
  const total = Number(countRes.rows[0].c);

  const offset = (page - 1) * pageSize;
  const limitIdx = values.length + 1;
  const offsetIdx = values.length + 2;
  const res = await pool.query(
    `SELECT * FROM posts ${where}
     ORDER BY COALESCE(published_at, created_at) DESC, id DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    [...values, pageSize, offset],
  );
  return { posts: res.rows.map(asPost), total };
}

export async function getAdminPosts(
  page = 1,
  pageSize = 10,
  q?: string,
  status?: PostStatus | '',
): Promise<{ posts: Post[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (q) {
    values.push(`%${q}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM posts ${where}`, values);
  const total = Number(countRes.rows[0].c);

  const offset = (page - 1) * pageSize;
  const limitIdx = values.length + 1;
  const offsetIdx = values.length + 2;
  const res = await pool.query(
    `SELECT * FROM posts ${where} ORDER BY id DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    [...values, pageSize, offset],
  );
  return { posts: res.rows.map(asPost), total };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await pool.query('SELECT * FROM posts WHERE slug = $1', [slug]);
  return res.rows.length ? asPost(res.rows[0]) : null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const res = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return res.rows.length ? asPost(res.rows[0]) : null;
}

export async function createPost(input: PostInput): Promise<Post> {
  const publishedAt = input.status === 'published' ? new Date().toISOString() : null;
  const res = await pool.query(
    `INSERT INTO posts (slug, title, summary, content, tags, status, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [input.slug, input.title, input.summary, input.content, input.tags, input.status, publishedAt],
  );
  return asPost(res.rows[0]);
}

export async function updatePost(id: number, input: PostInput): Promise<Post | null> {
  const existing = await getPostById(id);
  if (!existing) return null;

  let publishedAt: string | null = existing.published_at as string | null;
  if (input.status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString();
  } else if (input.status === 'draft') {
    publishedAt = null;
  }

  const res = await pool.query(
    `UPDATE posts
     SET slug = $1, title = $2, summary = $3, content = $4, tags = $5, status = $6, published_at = $7, updated_at = now()
     WHERE id = $8 RETURNING *`,
    [input.slug, input.title, input.summary, input.content, input.tags, input.status, publishedAt, id],
  );
  return asPost(res.rows[0]);
}

export async function deletePost(id: number): Promise<void> {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}

export async function getStats(): Promise<Stats> {
  const res = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'published')::int AS published,
      COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
      COUNT(*) FILTER (WHERE date_trunc('month', created_at) = date_trunc('month', now()))::int AS monthnew
    FROM posts
  `);
  const r = res.rows[0];
  return { total: r.total, published: r.published, draft: r.draft, monthNew: r.monthnew };
}

export async function getAbout(): Promise<AboutData> {
  let res = await pool.query('SELECT * FROM about WHERE id = 1');
  if (res.rows.length === 0) {
    await pool.query(`INSERT INTO about (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
    res = await pool.query('SELECT * FROM about WHERE id = 1');
  }
  return res.rows[0] as AboutData;
}

export async function updateAbout(input: {
  avatar: string;
  bio: string;
  contact: string;
  social_links: string;
}): Promise<AboutData> {
  await pool.query(
    `INSERT INTO about (id, avatar, bio, contact, social_links, updated_at)
     VALUES (1, $1, $2, $3, $4, now())
     ON CONFLICT (id) DO UPDATE SET
       avatar = EXCLUDED.avatar,
       bio = EXCLUDED.bio,
       contact = EXCLUDED.contact,
       social_links = EXCLUDED.social_links,
       updated_at = now()`,
    [input.avatar, input.bio, input.contact, input.social_links],
  );
  return getAbout();
}

export async function getUserByUsername(username: string) {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0] as { id: number; username: string; password_hash: string } | undefined;
}

export async function updateUserPassword(username: string, hash: string): Promise<void> {
  await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, username]);
}
