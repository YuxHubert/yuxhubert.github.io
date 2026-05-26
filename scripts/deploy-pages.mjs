import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_OWNER = 'YuxHubert';
const DEFAULT_REPO = 'yuxhubert.github.io';

export function assertInsideWorkspace(workspace, target) {
  const resolvedWorkspace = path.resolve(workspace);
  const resolvedTarget = path.resolve(target);
  const normalizedWorkspace = resolvedWorkspace.toLowerCase();
  const normalizedTarget = resolvedTarget.toLowerCase();
  const prefix = normalizedWorkspace.endsWith(path.sep)
    ? normalizedWorkspace
    : `${normalizedWorkspace}${path.sep}`;

  if (
    normalizedTarget === normalizedWorkspace ||
    !normalizedTarget.startsWith(prefix)
  ) {
    throw new Error(`Refusing to use path outside workspace: ${resolvedTarget}`);
  }

  return resolvedTarget;
}

export function getNoreplyEmail(user) {
  if (!user?.id || !user?.login) {
    throw new Error('GitHub user id and login are required for noreply email.');
  }

  return `${user.id}+${user.login}@users.noreply.github.com`;
}

export function getNpmCommand(platform = process.platform) {
  return platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function createPublishPlan({
  dryRun = false,
  owner = DEFAULT_OWNER,
  publishDir,
  repo = DEFAULT_REPO,
  user,
  workspace,
}) {
  const safePublishDir = assertInsideWorkspace(workspace, publishDir);

  return {
    distDir: path.join(path.resolve(workspace), 'dist'),
    gitUserEmail: getNoreplyEmail(user),
    gitUserName: user.login,
    publishDir: safePublishDir,
    remote: `https://github.com/${owner}/${repo}.git`,
    shouldPush: !dryRun,
  };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: false,
    stdio: options.capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    const message =
      result.error?.message || result.stderr || result.stdout || `${command} failed`;
    throw new Error(message.trim());
  }

  return result.stdout?.trim() ?? '';
}

function findGitHubCli() {
  const candidates =
    process.platform === 'win32'
      ? [
          process.env.GH_CLI,
          'C:\\Program Files\\GitHub CLI\\gh.exe',
          'C:\\Program Files (x86)\\GitHub CLI\\gh.exe',
          'gh',
        ]
      : [process.env.GH_CLI, 'gh'];

  return candidates.find((candidate) => candidate && (candidate === 'gh' || existsSync(candidate)));
}

function getAuthenticatedUser(gh) {
  return JSON.parse(run(gh, ['api', 'user'], { capture: true }));
}

async function preparePublishDirectory(plan) {
  if (existsSync(plan.publishDir)) {
    await rm(plan.publishDir, { force: true, recursive: true });
  }

  await mkdir(plan.publishDir, { recursive: true });
  await cp(plan.distDir, plan.publishDir, { recursive: true });
  await writeFile(path.join(plan.publishDir, '.nojekyll'), '');
}

export async function publishPages({
  dryRun = false,
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  workspace = process.cwd(),
} = {}) {
  const gh = findGitHubCli();
  if (!gh) {
    throw new Error('GitHub CLI was not found. Install gh or set GH_CLI.');
  }

  const user = getAuthenticatedUser(gh);
  const plan = createPublishPlan({
    dryRun,
    owner,
    publishDir: path.join(workspace, '.worktrees', 'pages-publish'),
    repo,
    user,
    workspace,
  });

  if (dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    return plan;
  }

  run(getNpmCommand(), ['run', 'build'], { cwd: workspace });
  await preparePublishDirectory(plan);

  run('git', ['init', '-b', 'gh-pages'], { cwd: plan.publishDir });
  run('git', ['config', 'user.name', plan.gitUserName], { cwd: plan.publishDir });
  run('git', ['config', 'user.email', plan.gitUserEmail], {
    cwd: plan.publishDir,
  });
  run('git', ['add', '.'], { cwd: plan.publishDir });
  run('git', ['commit', '-m', 'deploy: publish static blog'], {
    cwd: plan.publishDir,
  });
  run('git', ['remote', 'add', 'origin', plan.remote], { cwd: plan.publishDir });
  run('git', ['push', 'origin', 'gh-pages', '--force'], {
    cwd: plan.publishDir,
  });

  return plan;
}

const entryPoint = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (entryPoint) {
  publishPages({ dryRun: process.argv.includes('--dry-run') }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
