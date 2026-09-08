// 初始化数据库：建表 + 种子数据（管理员账号、示例文章、关于我）
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new DatabaseSync(path.join(dataDir, 'blog.db'));

db.exec(`
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

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'admin123';
const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
if (!existing) {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log('已创建管理员账号');
}

const about = db.prepare('SELECT id FROM about WHERE id = 1').get();
if (!about) {
  db.prepare(
    'INSERT INTO about (id, avatar, bio, contact, social_links) VALUES (1, ?, ?, ?, ?)',
  ).run('', '这里是我的个人简介，欢迎来访。', 'contact@example.com', '[]');
}

const { c } = db.prepare('SELECT COUNT(*) AS c FROM posts').get();
if (Number(c) === 0) {
  db.prepare(
    `INSERT INTO posts (slug, title, summary, content, tags, status, published_at)
     VALUES (?, ?, ?, ?, ?, 'published', datetime('now'))`,
  ).run(
    'hello-world',
    '你好，世界',
    '这是我的第一篇博客文章。',
    '# 你好，世界 👋\n\n欢迎来到我的博客！这是一篇示例文章，你可以在后台删除它。\n\n## 支持的语法\n\n- 列表\n- **加粗**\n- `行内代码`\n\n```js\nconsole.log("代码高亮");\n```\n\n> 引用块',
    '随笔',
  );
}

console.log('✅ 初始化完成');
console.log(`   管理员账号：${username}`);
console.log(`   管理员密码：${password}`);
console.log('   （登录后请尽快在后台修改密码）');
