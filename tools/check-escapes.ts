/**
 * Fails on a way around a gate. A rule that fires is fixed in the code; a rule that is wrong
 * changes in tools/config, in its own PR.
 * - Any `oxlint-disable`, `eslint-disable` (or `-enable`) comment, `@ts-ignore`,
 *   `@ts-expect-error` or `@ts-nocheck` in tracked source. This is a script, not a lint
 *   rule, because a file-level disable comment would silence the rule that bans it.
 * - With a base commit (CI passes the PR's base): a route budget in
 *   apps/web/bundleBudget.ts that grew. A new route may add its own.
 *   node tools/check-escapes.ts [base-sha]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const BUDGET_FILE = 'apps/web/bundleBudget.ts';

const ESCAPE = /(oxlint|eslint)-(disable|enable)|@ts-(ignore|expect-error|nocheck)/;

const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

// consumers/ asserts with @ts-expect-error that the published types reject wrong calls;
// packages/lint/src/anti-slop/vendor is ESLint Stylistic's code, kept as upstream wrote it; this
// file names the comments it bans. Untracked files count too, so a new file is checked before its
// commit.
const sources = git(
  'ls-files',
  '--cached',
  '--others',
  '--exclude-standard',
  '*.ts',
  '*.tsx',
  '*.js',
  '*.mjs',
)
  .split('\n')
  .filter(
    (file) =>
      file &&
      file !== 'tools/check-escapes.ts' &&
      !/^(consumers|packages\/lint\/src\/anti-slop\/vendor)\//.test(file),
  );

const escapes = sources.flatMap((file) =>
  readFileSync(join(root, file), 'utf8')
    .split('\n')
    .flatMap((line, index) => (ESCAPE.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : [])),
);

const budgets = (source: string) =>
  new Map(
    [...source.matchAll(/^ {2}'([^']+)': (\d+),$/gm)].map(([, route = '', kb = '']) => [
      route,
      Number(kb),
    ]),
  );

const atBase = (base: string) => {
  try {
    return git('show', `${base}:${BUDGET_FILE}`);
  } catch {
    // The base has no budgets yet.
    return '';
  }
};

const grown = (base: string) => {
  const before = budgets(atBase(base));
  const after = budgets(readFileSync(join(root, BUDGET_FILE), 'utf8'));

  return [...after].flatMap(([route, kb]) => {
    const was = before.get(route);

    return was !== undefined && kb > was ? [`${BUDGET_FILE}: ${route} ${was} kB -> ${kb} kB`] : [];
  });
};

const base = process.argv[2];

if (base !== undefined && !/^[\w./]+$/.test(base)) throw new Error(`Not a commit: ${base}`);

const problems = [...escapes, ...(base ? grown(base) : [])];

for (const problem of problems) process.stderr.write(`${problem}\n`);

if (problems.length > 0) {
  process.stderr.write(
    'check-escapes: fix the code instead of silencing a check or raising a budget. A rule or budget that is wrong changes in its own PR.\n',
  );
  process.exitCode = 1;
}
