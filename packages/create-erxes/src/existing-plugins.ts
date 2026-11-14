import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { x } from 'tinyexec';

/** The old erxes plugins a new-core plugin can be migrated from (`backend/plugins/<name>_api`). */
export const OLD_PLUGINS = [
  'accounting',
  'content',
  'frontline',
  'insurance',
  'loyalty',
  'mastra',
  'mongolian',
  'operation',
  'payment',
  'posclient',
  'sales',
  'tourism',
] as const;

export type OldPlugin = (typeof OLD_PLUGINS)[number];

export const isOldPlugin = (name: string): name is OldPlugin =>
  OLD_PLUGINS.some((plugin) => plugin === name);

const ERXES_REPO = 'https://github.com/erxes/erxes.git';
export const DEFAULT_REF = 'origin/main';

const git = async (args: string[], cwd?: string) => {
  const result = await x('git', args, { nodeOptions: { cwd }, throwOnError: false });

  if (result.exitCode !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr.trim()}`);
};

export const erxesCacheDir = () =>
  join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'create-erxes', 'erxes');

/** A shallow, blobless clone of erxes/erxes main that checks out only the plugin folders. */
export const cloneErxes = async () => {
  const dir = erxesCacheDir();

  if (existsSync(join(dir, '.git'))) {
    await git(['fetch', '-q', '--depth=1', 'origin', 'main'], dir);
    await git(['checkout', '-q', '--detach', DEFAULT_REF], dir);

    return dir;
  }

  await mkdir(dirname(dir), { recursive: true });
  await git(['clone', '-q', '--depth=1', '--filter=blob:none', '--sparse', ERXES_REPO, dir]);
  await git(['sparse-checkout', 'set', 'backend/plugins', 'frontend/plugins'], dir);

  return dir;
};
