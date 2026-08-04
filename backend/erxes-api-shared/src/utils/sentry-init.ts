/**
 * Shared Sentry initialization utilities for erxes services.
 *
 * Extracted to eliminate duplication across sentry-instrument.ts files
 * (shared, core-api, gateway).
 */

import * as Sentry from '@sentry/node';
import * as fs from 'node:fs';
import * as path from 'node:path';

function findUp(startDir: string, predicate: (dir: string) => boolean) {
  let dir = startDir;
  for (let i = 0; i < 25; i++) {
    if (predicate(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function readTextSafe(filePath: string) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

function resolveGitSha(repoRoot: string) {
  const gitDir = path.join(repoRoot, '.git');
  const head = readTextSafe(path.join(gitDir, 'HEAD'))?.trim();
  if (!head) return undefined;

  if (!head.startsWith('ref:')) {
    return head;
  }

  const ref = head.slice('ref:'.length).trim(); // refs/heads/main
  const refPath = path.join(gitDir, ref);
  const shaFromRef = readTextSafe(refPath)?.trim();
  if (shaFromRef) return shaFromRef;

  const packedRefs = readTextSafe(path.join(gitDir, 'packed-refs'));
  if (!packedRefs) return undefined;

  const lines = packedRefs.split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('^')) continue;
    const [sha, packedRef] = line.split(' ');
    if (packedRef === ref && sha) return sha.trim();
  }

  return undefined;
}

function resolveRepoVersion(repoRoot: string) {
  const pkgJson = readTextSafe(path.join(repoRoot, 'package.json'));
  if (!pkgJson) return undefined;
  try {
    const parsed = JSON.parse(pkgJson) as { version?: string };
    return parsed.version;
  } catch {
    return undefined;
  }
}

function getSentryRelease() {
  const fromEnv = process.env.SENTRY_RELEASE || process.env.RELEASE;
  if (fromEnv) {
    const normalized = fromEnv.trim();
    const placeholders = new Set([
      'master',
      'main',
      'latest',
      'erxes-<git-sha-or-version>',
      'erxes@<git-sha-or-version>',
    ]);

    if (!placeholders.has(normalized.toLowerCase())) {
      return normalized;
    }
  }

  const fromCiSha =
    process.env.GIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.BUILDKITE_COMMIT;
  if (fromCiSha) return `erxes@${fromCiSha.slice(0, 12)}`;

  const cwd = process.cwd();
  const repoRoot = findUp(cwd, (dir) => fs.existsSync(path.join(dir, '.git')));
  if (repoRoot) {
    const sha = resolveGitSha(repoRoot);
    if (sha) return `erxes@${sha.slice(0, 12)}`;

    const version = resolveRepoVersion(repoRoot);
    if (version) return `erxes@v${version}`;
  }

  return undefined;
}

/**
 * Initialize Sentry with the standard erxes configuration.
 *
 * @param beforeSend - Optional beforeSend hook (e.g. sentryExpectedErrorFilter)
 * @param serverName - Optional server name override (defaults to env or 'erxes')
 */
export function initErxesSentry(
  beforeSend?: (event: Sentry.ErrorEvent, hint?: Sentry.EventHint) => PromiseLike<Sentry.ErrorEvent | null> | Sentry.ErrorEvent | null,
  serverName?: string,
) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: getSentryRelease(),
    serverName: serverName || process.env.SENTRY_SERVER_NAME,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    ...(beforeSend ? { beforeSend } : {}),
  });
}
