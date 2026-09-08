# CLAUDE.md

本文件为 Claude Code 在此仓库中工作时提供指引。

## 项目概述

myblog —— 个人博客系统，前后端一体的 Next.js 应用，包含两个端：

- **用户端**（公开）：首页、文章详情、标签筛选、关于我。
- **管理后台**（需登录）：仪表盘、文章增删改查、关于我编辑。

唯一管理员，用账号密码登录。读者无需登录，评论功能不需要。

## 技术栈

- Next.js（App Router）+ TypeScript
- Tailwind CSS（响应式）
- SQLite + Drizzle ORM
- 认证：httpOnly Cookie 会话 + bcrypt 密码哈希
- Markdown：react-markdown + remark-gfm + rehype-highlight + rehype-sanitize
- 表单校验：zod

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run start        # 生产启动
npm run lint         # 代码检查
npm run db:generate  # 生成 Drizzle 迁移
npm run db:migrate   # 执行迁移
npm run db:seed      # 初始化种子数据（admin 账号）
```

## 目录结构

```
src/
  app/                      # 页面与接口（App Router，目录即路由）
    page.tsx                # 首页 /
    about/page.tsx          # /about
    posts/[slug]/page.tsx   # /posts/[slug]
    tags/[tag]/page.tsx     # /tags/[tag]
    admin/                  # 后台（全部需鉴权）
      login/page.tsx
      page.tsx              # 仪表盘
      posts/page.tsx
      posts/new/page.tsx
      posts/[id]/edit/page.tsx
      about/page.tsx
    api/                    # Route Handlers
      auth/login/route.ts
      auth/logout/route.ts
      posts/route.ts
      posts/[id]/route.ts
      about/route.ts
  components/               # 复用组件（文章卡片、分页、导航、Markdown 渲染器等）
  lib/
    db/                     # 数据库连接、schema、迁移
    auth.ts                 # 会话与鉴权逻辑
```

## 架构约定

- **前后端一体**：页面在 `src/app/**/page.tsx`，接口在 `src/app/api/**/route.ts`。
- **数据访问**统一走 `src/lib/db`，页面/接口不直接碰数据库连接。
- **鉴权**：后台页面与写操作接口必须校验会话（见 `src/lib/auth.ts`）；未登录访问 `/admin/*` 重定向到 `/admin/login`。
- **公开页面**不做鉴权；但文章列表/详情只展示 `status = 'published'` 的内容（草稿对用户端不可见）。

## 数据库 Schema（3 张表）

- **users**：`id`, `username`(唯一), `password_hash`, `created_at`
- **posts**：`id`, `slug`(唯一), `title`, `summary`(可空), `content`(Markdown), `tags`(逗号分隔), `status`(`published`|`draft`), `published_at`(可空), `created_at`, `updated_at`
- **about**：`id`(固定 1), `avatar`, `bio`, `contact`, `social_links`(JSON), `updated_at`

## 关键约定

- **slug**：唯一，默认由标题生成（英文/拼音），作为文章 URL。
- **摘要**：`summary` 留空时自动截取正文前 100 字。
- **标签**：逗号分隔字符串，点击进入 `/tags/[tag]` 筛选页。
- **删除**：物理删除（二次确认）。
- **统计**：「本月新增」= 自然月内新增文章数。
- **Markdown 安全**：任何用户输入的内容渲染前必须经过 sanitize（防 XSS）。
- **SEO**：每篇文章生成 title / description / OG 元信息。

## 参考文档

- `memory-bank/prd.md` —— 产品需求（已定稿）
- `memory-bank/plan.md` —— 实现方案

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
