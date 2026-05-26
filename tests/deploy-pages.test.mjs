import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  assertInsideWorkspace,
  createPublishPlan,
  getNoreplyEmail,
} from '../scripts/deploy-pages.mjs';

test('creates the GitHub noreply email for the authenticated account', () => {
  assert.equal(
    getNoreplyEmail({ id: 127934866, login: 'YuxHubert' }),
    '127934866+YuxHubert@users.noreply.github.com',
  );
});

test('rejects publish paths outside the workspace', () => {
  const workspace = path.resolve('D:/Workspace/LearnAllLanuage');
  const outside = path.resolve('D:/Workspace/outside-pages-publish');

  assert.throws(
    () => assertInsideWorkspace(workspace, outside),
    /outside workspace/,
  );
});

test('plans the gh-pages publish commands without pushing in dry-run mode', () => {
  const workspace = path.resolve('D:/Workspace/LearnAllLanuage');
  const plan = createPublishPlan({
    dryRun: true,
    owner: 'YuxHubert',
    publishDir: path.join(workspace, '.worktrees', 'pages-publish'),
    repo: 'yuxhubert.github.io',
    user: { id: 127934866, login: 'YuxHubert' },
    workspace,
  });

  assert.equal(plan.gitUserEmail, '127934866+YuxHubert@users.noreply.github.com');
  assert.equal(plan.remote, 'https://github.com/YuxHubert/yuxhubert.github.io.git');
  assert.equal(plan.shouldPush, false);
});
