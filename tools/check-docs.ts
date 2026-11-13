/**
 * Fails when an AGENTS.md or SKILL.md names, in backticks, something this repo doesn't have:
 * a repo path, a `vp run` or `pnpm` script, or a function called as `name(...)`. Docs that
 * point at a renamed file or a deleted script send the next agent the wrong way.
 *   node tools/check-docs.ts   (part of `vp run check`)
 * Only names it can resolve are checked: placeholders (`<feature>`), globs, URL paths and
 * package imports are skipped, so it never fails on a line that is right.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';

const root = resolve(import.meta.dirname, '..');

const git = (...args: string[]) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);

const tracked = git('ls-files');
const docs = tracked.filter((file) => /(^|\/)(AGENTS|SKILL)\.md$/.test(file));
const basenames = new Set(tracked.map((file) => file.split('/').at(-1)));

/** Every word in tracked code, so a doc's `name()` must be one the code has. */
const words = new Set(
  tracked
    .filter((file) => /\.(ts|tsx|sql|sh)$/.test(file))
    .flatMap((file) => readFileSync(join(root, file), 'utf8').match(/[\w$]+/g) ?? []),
);

const PackageJson = z.object({
  name: z.string().optional(),
  scripts: z.record(z.string(), z.string()).default({}),
});

const packages = new Map(
  ['.', ...tracked.filter((file) => file.endsWith('/package.json')).map(dirname)].map((dir) => [
    dir,
    PackageJson.parse(JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8'))),
  ]),
);

const dirOf = new Map([...packages].map(([dir, pkg]) => [pkg.name, dir]));

/** What `vp run` runs at the root: the tasks in vite.config.ts and the package.json scripts. */
const TaskGraph = z.object({
  tasks: z.record(z.string(), z.object({ package: z.string(), name: z.string() })),
});

const rootRuns = new Set(
  Object.values(
    TaskGraph.parse(
      JSON.parse(execFileSync('vp', ['run', '--json'], { cwd: root, encoding: 'utf8' })),
    ).tasks,
  )
    .filter((task) => task.package === '.')
    .map((task) => task.name),
);

const PNPM_BUILTINS = new Set(
  'add audit create dlx exec i import install licenses link list ls outdated pack patch prune publish rebuild remove rm store update up why'.split(
    ' ',
  ),
);

/** The script a `pnpm …` or `vp run …` command runs, with the package that must have it. */
const scriptProblem = (command: string) => {
  const vp = /^vp run (\S+)/.exec(command);

  if (vp?.[1]) return rootRuns.has(vp[1]) ? undefined : `no vp task or script "${vp[1]}"`;

  const [, ...args] = command.split(/\s+/);
  const filter = args[0] === '--filter' ? args[1] : undefined;
  const name = (filter ? args.slice(2) : args).filter((arg) => !arg.startsWith('-'))[0];
  const script = name === 'run' ? args[args.indexOf('run') + 1] : name;

  if (!script || PNPM_BUILTINS.has(script)) return undefined;

  const dir = filter ? dirOf.get(filter) : '.';
  const scripts = dir === undefined ? undefined : packages.get(dir)?.scripts;

  if (!scripts) return `no workspace package "${filter}"`;

  return script in scripts ? undefined : `no script "${script}" in ${dir}/package.json`;
};

/** A repo path: checked from the doc's folder, its package, its package's src, and the root. */
const pathProblem = (token: string, doc: string) => {
  const docDir = dirname(doc);
  const pkg = [...packages.keys()].filter((dir) => dir === '.' || doc.startsWith(`${dir}/`));
  const bases = [docDir, ...pkg, ...pkg.map((dir) => join(dir, 'src'))];
  const first = token.split('/')[0] ?? '';

  // `react-dom/client`, `shop/settings`: not a path into this repo.
  if (!bases.some((base) => first && existsSync(join(root, base, first)))) return undefined;

  if (bases.some((base) => existsSync(join(root, base, token)))) return undefined;

  return isIgnored(token) ? undefined : `no file or folder ${token}`;
};

const isIgnored = (path: string) => {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', path], { cwd: root });

    return true;
  } catch {
    return false;
  }
};

const problemOf = (token: string, doc: string) => {
  if (/^(pnpm|vp run) /.test(token)) return scriptProblem(token);

  const call = /^([a-z_$][\w$]*)\(/i.exec(token)?.[1];

  if (call) return words.has(call) ? undefined : `no ${call} in the code`;

  // Placeholders, globs, URL paths, package names, aliases and import specifiers.
  if (/[\s<>*{}$:…]/.test(token) || /^(\/|@|~|\.\.?\/)/.test(token)) return undefined;

  if (token.includes('/')) return pathProblem(token.replace(/\/$/, ''), doc);

  // A bare file name: some tracked file has it.
  if (/^[\w.-]+\.(ts|tsx|md|json|sh|tla|yml)$/.test(token))
    return basenames.has(token) ? undefined : `no file named ${token}`;

  return undefined;
};

const problems = docs.flatMap((doc) =>
  readFileSync(join(root, doc), 'utf8')
    .split('\n')
    .flatMap((line, index) =>
      [...line.matchAll(/`([^`]+)`/g)].flatMap(([, token = '']) => {
        const problem = problemOf(token.trim(), doc);

        return problem ? [`${doc}:${index + 1}: \`${token}\`: ${problem}`] : [];
      }),
    ),
);

for (const problem of problems) process.stderr.write(`${problem}\n`);

if (problems.length > 0) {
  process.stderr.write(`check-docs: ${problems.length} stale name(s). Fix the doc line.\n`);
  process.exitCode = 1;
}
