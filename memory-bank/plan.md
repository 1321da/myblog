# 实现方案（myblog）

> 对应 PRD v1.1。用于指导编码实现。

## 1. 技术选型
- 框架：Next.js（App Router）+ TypeScript
- 样式：Tailwind CSS
- 数据库：PostgreSQL（Neon 托管，@neondatabase/serverless）
- 认证：httpOnly Cookie 会话 + bcrypt
- Markdown：react-markdown + remark-gfm + rehype-highlight + rehype-sanitize
- 表单校验：zod
- 部署：Docker → VPS / Railway / Render（持久磁盘）

## 2. 目录结构
```
src/
  app/                      # 页面与接口
    page.tsx                # 首页 /
    about/page.tsx          # /about
    posts/[slug]/page.tsx   # /posts/[slug]
    tags/[tag]/page.tsx     # /tags/[tag]
    admin/
      login/page.tsx        # 登录
      page.tsx              # 仪表盘
      posts/page.tsx        # 文章列表
      posts/new/page.tsx    # 新建
      posts/[id]/edit/page.tsx
      about/page.tsx        # 关于我管理
    api/
      auth/login/route.ts
      auth/logout/route.ts
      posts/route.ts
      posts/[id]/route.ts
      about/route.ts
  components/               # 复用组件
  lib/
    db/                     # 连接 + schema + 迁移
    auth.ts                 # 会话与鉴权
```

## 3. 路由设计
- 公开：`/`、`/posts/[slug]`、`/tags/[tag]`、`/about`
- 后台（需登录）：`/admin/*`
- API：`POST /api/auth/login`、`POST /api/auth/logout`、`GET|POST /api/posts`、`GET|PUT|DELETE /api/posts/[id]`、`GET|PUT /api/about`

## 4. 数据库 Schema
- **users**：id, username(unique), password_hash, created_at
- **posts**：id, slug(unique), title, summary?, content, tags, status(published|draft), published_at?, created_at, updated_at
- **about**：id(固定 1), avatar, bio, contact, social_links(JSON), updated_at

## 5. 实现步骤
- M0 脚手架：Next.js + TS + Tailwind + SQLite 跑通
- M1 数据层：建表 + 迁移 + 种子（admin）
- M2 用户端：首页/详情/标签/关于我
- M3 登录：登录页 + 会话 + 后台拦截
- M4 后台：仪表盘 + 文章 CRUD + 关于我编辑
- M5 打磨：响应式/SEO/空状态/安全
- M6 部署：Docker 化 + 上线
