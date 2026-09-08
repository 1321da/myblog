// 初始化 Postgres(Neon) 数据库：建表 + 种子数据（管理员账号、示例文章、关于我）
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ 缺少环境变量 DATABASE_URL（Neon 连接字符串）');
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS about (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    avatar TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    social_links TEXT NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';
const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
if (existing.rows.length === 0) {
  const hash = bcrypt.hashSync(password, 10);
  await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);
  console.log('已创建管理员账号');
}

const about = await pool.query('SELECT id FROM about WHERE id = 1');
if (about.rows.length === 0) {
  await pool.query(
    'INSERT INTO about (id, avatar, bio, contact, social_links) VALUES (1, $1, $2, $3, $4)',
    ['', '这里是我的个人简介，欢迎来访。', 'contact@example.com', '[]'],
  );
}

const count = await pool.query('SELECT COUNT(*)::int AS c FROM posts');
if (Number(count.rows[0].c) === 0) {
  await pool.query(
    `INSERT INTO posts (slug, title, summary, content, tags, status, published_at)
     VALUES ($1, $2, $3, $4, $5, 'published', now())`,
    [
      'hello-world',
      '你好，世界',
      '这是我的第一篇博客文章。',
      '# 你好，世界 👋\n\n欢迎来到我的博客！这是一篇示例文章，你可以在后台删除它。\n\n## 支持的语法\n\n- 列表\n- **加粗**\n- `行内代码`\n\n```js\nconsole.log("代码高亮");\n```\n\n> 引用块',
      '随笔',
    ],
  );
}

await pool.end();
console.log('✅ 初始化完成');
console.log(`   管理员账号：${username}`);
console.log(`   管理员密码：${password}`);
console.log('   （登录后请尽快在后台修改密码）');
