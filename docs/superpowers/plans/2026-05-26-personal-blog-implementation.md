# 个人博客网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个可写 Markdown、可本地构建、可通过 GitHub Actions 自动部署到 `https://yuxhubert.github.io/` 的 Astro 个人博客。

**Architecture:** 使用 Astro 生成静态站点，Markdown 文章由 Astro content collections 管理。GitHub Actions 使用官方 GitHub Pages 部署流程，每次推送 `main` 自动构建并发布 `dist` 产物。

**Tech Stack:** Astro, TypeScript, Markdown, npm, GitHub Actions, GitHub Pages, GitHub CLI.

---

## 文件结构

- Create: `package.json`，定义 npm 脚本和 Astro 依赖。
- Create: `package-lock.json`，锁定依赖版本，供本地和 CI 使用 `npm ci`。
- Create: `astro.config.mjs`，配置站点地址 `https://yuxhubert.github.io/`。
- Create: `tsconfig.json`，继承 Astro 推荐 TypeScript 配置。
- Create: `.gitignore`，忽略依赖、构建产物、环境文件和系统文件。
- Create: `src/env.d.ts`，声明 Astro 类型。
- Create: `src/content.config.ts`，定义博客文章集合、frontmatter schema 和 Markdown 加载规则。
- Create: `src/content/blog/*.md`，放置示例博客文章。
- Create: `src/lib/posts.ts`，封装文章读取、过滤和排序逻辑。
- Create: `src/layouts/BaseLayout.astro`，提供全站 HTML 外壳、导航、页脚和元信息。
- Create: `src/pages/index.astro`，首页，展示作者简介和最近文章。
- Create: `src/pages/posts/index.astro`，文章列表页。
- Create: `src/pages/posts/[...slug].astro`，文章详情页。
- Create: `src/styles/global.css`，全局视觉样式和响应式排版。
- Create: `public/favicon.svg`，轻量站点图标。
- Create: `tests/static-site.test.mjs`，验证构建后的首页、文章列表和文章详情 HTML。
- Create: `.github/workflows/deploy.yml`，GitHub Pages CI/CD 工作流。
- Modify: `docs/superpowers/specs/2026-05-25-personal-blog-design.md`，仅在实施发现规格需要纠正时修改。

## Task 1: 准备本地工具和 GitHub CLI

**Files:**
- No code files expected.

- [ ] **Step 1: 检查 Node.js、npm、GitHub CLI 和 winget**

Run:

```powershell
node --version
npm --version
git --version
if (Get-Command gh -ErrorAction SilentlyContinue) { gh --version } else { "GH_MISSING" }
if (Get-Command winget -ErrorAction SilentlyContinue) { winget --version } else { "WINGET_MISSING" }
```

Expected: Node.js、npm 和 git 可用；如果 `gh` 缺失且 `winget` 可用，进入下一步安装。

- [ ] **Step 2: 安装 GitHub CLI（如果缺失）**

Run:

```powershell
winget install --id GitHub.cli -e --source winget
```

Expected: GitHub CLI 安装成功。安装后重新打开或刷新 shell，再运行 `gh --version`。

- [ ] **Step 3: 检查 GitHub CLI 登录状态**

Run:

```powershell
gh auth status
```

Expected: 已登录 GitHub。若未登录，运行：

```powershell
gh auth login --hostname github.com --git-protocol https --web --scopes "repo,workflow"
```

Expected: 浏览器完成授权后，`gh auth status` 显示已登录。

## Task 2: 创建 Astro 项目基础骨架

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/env.d.ts`

- [ ] **Step 1: 创建 `package.json`**

Target content:

```json
{
  "name": "yuxhubert.github.io",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test tests/*.test.mjs"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: 安装依赖并生成 lockfile**

Run:

```powershell
npm install
```

Expected: `package-lock.json` 生成，`node_modules` 安装成功。

- [ ] **Step 3: 创建 Astro 配置和 TypeScript 配置**

Target `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yuxhubert.github.io',
});
```

Target `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Target `src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 4: 创建 `.gitignore`**

Target content:

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
```

- [ ] **Step 5: 运行一次空项目构建**

Run:

```powershell
npm run build
```

Expected: Astro 构建成功。如果因为还没有页面失败，则在 Task 4 页面创建后重新验证。

- [ ] **Step 6: 提交项目基础骨架**

Run:

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/env.d.ts
git commit -m "feat: scaffold Astro blog"
```

Expected: 提交成功。

## Task 3: 添加博客内容模型和示例文章

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/welcome.md`
- Create: `src/content/blog/learning-notes.md`
- Create: `src/content/blog/tools-and-workflow.md`
- Create: `src/lib/posts.ts`

- [ ] **Step 1: 创建内容集合配置**

Target `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: 创建文章读取工具**

Target `src/lib/posts.ts`:

```ts
import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

- [ ] **Step 3: 添加 3 篇示例 Markdown 文章**

Each file should include:

```markdown
---
title: "文章标题"
description: "一句话摘要。"
pubDate: 2026-05-26
tags: ["博客", "记录"]
---

正文内容。
```

Expected: 文章内容中性、可替换，不包含虚假的个人经历。

- [ ] **Step 4: 运行内容类型生成检查**

Run:

```powershell
npm run build
```

Expected: 如果页面尚未创建导致失败，确认错误仅来自缺少页面；内容 schema 不应报错。

- [ ] **Step 5: 提交内容模型和文章**

Run:

```powershell
git add src/content.config.ts src/content/blog src/lib/posts.ts
git commit -m "feat: add blog content collection"
```

Expected: 提交成功。

## Task 4: 实现页面、布局和样式

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/posts/index.astro`
- Create: `src/pages/posts/[...slug].astro`
- Create: `src/styles/global.css`
- Create: `public/favicon.svg`
- Create: `tests/static-site.test.mjs`

- [ ] **Step 1: 写静态站点 smoke tests**

Target `tests/static-site.test.mjs`:

```js
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

const dist = path.resolve('dist');

async function readBuiltPage(relativePath) {
  return readFile(path.join(dist, relativePath), 'utf8');
}

test('homepage introduces the blog and links to recent posts', async () => {
  const html = await readBuiltPage('index.html');
  assert.match(html, /Yuxhubert/);
  assert.match(html, /最近文章/);
  assert.match(html, /\/posts\/welcome\//);
});

test('post index lists starter posts', async () => {
  const html = await readBuiltPage(path.join('posts', 'index.html'));
  assert.match(html, /全部文章/);
  assert.match(html, /欢迎来到我的博客/);
  assert.match(html, /学习笔记/);
});

test('post detail page renders Markdown content', async () => {
  const html = await readBuiltPage(path.join('posts', 'welcome', 'index.html'));
  assert.match(html, /欢迎来到我的博客/);
  assert.match(html, /Markdown/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm test
```

Expected: FAIL because `dist/index.html` or equivalent built pages do not exist yet.

- [ ] **Step 3: 创建基础布局**

`BaseLayout.astro` should accept `title` and `description`, render global navigation, include `global.css`, and expose a `<slot />` for page content.

- [ ] **Step 4: 创建首页**

`index.astro` should import `getPublishedPosts()`, display a short author intro, and show the latest 3 posts with title, date, description, and tags.

- [ ] **Step 5: 创建文章列表页**

`posts/index.astro` should list all published posts in reverse chronological order and link to `/posts/<slug>/`.

- [ ] **Step 6: 创建文章详情页**

`posts/[...slug].astro` should:

```ts
import { render } from 'astro:content';
import { getPublishedPosts, formatPostDate } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
```

Expected: Every Markdown post renders at `/posts/<file-name>/`.

- [ ] **Step 7: 创建全局样式**

`global.css` should cover:

- CSS custom properties for colors, spacing, borders, and shadows.
- Mobile-first layout.
- Readable article typography.
- Header navigation and footer.
- Post list cards with stable spacing.
- Reduced motion friendly hover/focus states.

- [ ] **Step 8: 添加 favicon**

Use a simple SVG mark in `public/favicon.svg`.

- [ ] **Step 9: 本地构建验证**

Run:

```powershell
npm run build
```

Expected: Build exits successfully and creates `dist/`.

- [ ] **Step 10: 运行 smoke tests 确认通过**

Run:

```powershell
npm test
```

Expected: PASS. The tests should read built HTML from `dist/`.

- [ ] **Step 11: 本地预览和视觉检查**

Run:

```powershell
npm run preview -- --host 127.0.0.1
```

Expected: Preview server starts. Open the local URL and verify homepage, post list, and post detail page render correctly on desktop and mobile widths.

- [ ] **Step 12: 提交页面、样式和测试**

Run:

```powershell
git add src/layouts src/pages src/styles public/favicon.svg tests/static-site.test.mjs package.json package-lock.json
git commit -m "feat: build personal blog pages"
```

Expected: 提交成功。

## Task 5: 添加 GitHub Pages CI/CD

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` if deployment checks reveal the site URL needs adjustment.

- [ ] **Step 1: 创建 GitHub Actions 工作流**

Target `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: 本地构建再次验证**

Run:

```powershell
npm run build
```

Expected: Build passes before pushing CI/CD changes.

- [ ] **Step 3: 提交 CI/CD 配置**

Run:

```powershell
git add .github/workflows/deploy.yml astro.config.mjs
git commit -m "ci: deploy blog to GitHub Pages"
```

Expected: 提交成功。

## Task 6: 创建或复用 GitHub 仓库并推送

**Files:**
- Git remote metadata only.

- [ ] **Step 1: 确认 GitHub CLI 账号**

Run:

```powershell
gh api user --jq .login
```

Expected: 输出 `yuxhubert`。如果输出不同，停止并确认账号。

- [ ] **Step 2: 创建或复用仓库**

Run:

```powershell
gh repo view yuxhubert/yuxhubert.github.io
```

If missing:

```powershell
gh repo create yuxhubert.github.io --public --source . --remote origin --description "Personal blog powered by Astro and GitHub Pages"
```

If existing:

```powershell
git remote add origin https://github.com/yuxhubert/yuxhubert.github.io.git
```

Expected: `origin` points to `https://github.com/yuxhubert/yuxhubert.github.io.git`.

- [ ] **Step 3: 启用 GitHub Pages Actions 部署模式**

Run:

```powershell
gh api repos/yuxhubert/yuxhubert.github.io/pages -X POST -f build_type=workflow
```

If Pages already exists, run:

```powershell
gh api repos/yuxhubert/yuxhubert.github.io/pages -X PATCH -f build_type=workflow
```

Expected: Repository Pages source is configured for GitHub Actions workflow deployments.

- [ ] **Step 4: 推送主分支**

Run:

```powershell
git push -u origin main
```

Expected: Push succeeds and triggers the `Deploy to GitHub Pages` workflow.

## Task 7: 远程部署验证

**Files:**
- No code files expected unless deployment fails and configuration fixes are needed.

- [ ] **Step 1: 监控 GitHub Actions 工作流**

Run:

```powershell
gh run list --repo yuxhubert/yuxhubert.github.io --limit 5
gh run watch --repo yuxhubert/yuxhubert.github.io
```

Expected: Latest deployment workflow completes successfully.

- [ ] **Step 2: 读取失败日志（仅当失败时）**

Run:

```powershell
gh run view --repo yuxhubert/yuxhubert.github.io --log-failed
```

Expected: Identify and fix configuration or build errors, then commit and push again.

- [ ] **Step 3: 检查线上地址**

Run:

```powershell
Invoke-WebRequest -Uri "https://yuxhubert.github.io/" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
```

Expected: `200`.

- [ ] **Step 4: 最终状态检查**

Run:

```powershell
git status --short
npm run build
```

Expected: Working tree clean and build passes.

- [ ] **Step 5: 最终提交或修正提交**

If fixes were needed after deployment:

```powershell
git add <changed-files>
git commit -m "fix: stabilize GitHub Pages deployment"
git push
```

Expected: All local and remote checks pass.
