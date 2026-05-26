---
title: "工具和工作流"
description: "记录这个博客使用的写作、构建和部署流程。"
pubDate: 2026-05-24
tags: ["工具", "工作流"]
---

这个博客使用 Astro 生成静态页面，使用 GitHub Actions 自动部署到 GitHub Pages。

日常写作流程可以保持很短：

1. 在 `src/content/blog/` 下创建一篇 Markdown 文件。
2. 填写标题、摘要、发布日期和标签。
3. 编写正文。
4. 提交并推送到 GitHub。

推送完成后，GitHub Actions 会构建网站并发布最新版本。
