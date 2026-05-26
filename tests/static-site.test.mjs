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
