import { execFileSync } from 'node:child_process';
import { existsSync, globSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** A generated plugin can run its gates before git init, including inside another repo. */
export const projectFiles = (root: string) => {
  let gitRoot: string | undefined;

  try {
    gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    // A fresh scaffold has no git repository yet.
  }

  if (gitRoot && resolve(gitRoot) === resolve(root)) {
    return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\0')
      .filter((file) => file && existsSync(join(root, file)));
  }

  return globSync(['**/*', '**/.*', '**/.*/**'], {
    cwd: root,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/.scratch/**',
      '**/.runtime/**',
      '**/coverage/**',
    ],
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(root.length + 1));
};
