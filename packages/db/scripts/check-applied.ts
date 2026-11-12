/**
 * Applied migrations never change: fails when a migration that exists at the
 * base commit was edited, renamed or deleted, or when the journal no longer
 * lists it first-to-last in the same order. New migrations are fine.
 *   pnpm db:check-applied <base ref>
 */
import { execFileSync } from 'node:child_process';
import { Journal } from '../src/migrate';

const DIR = 'packages/db/drizzle';

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', cwd: new URL('../../..', import.meta.url) });

const say = (line: string) => process.stdout.write(`${line}\n`);

const commitExists = (ref: string) => {
  try {
    git('cat-file', '-e', `${ref}^{commit}`);

    return true;
  } catch {
    return false;
  }
};

/** Migration tags in journal order at a commit (none when the journal didn't exist yet). */
const journal = (ref: string) => {
  try {
    return Journal.parse(JSON.parse(git('show', `${ref}:${DIR}/meta/_journal.json`))).entries.map(
      (entry) => entry.tag,
    );
  } catch {
    return [];
  }
};

/** SQL files changed since `base` other than by being added. */
const changedFiles = (base: string) =>
  git('diff', '--name-status', base, 'HEAD', '--', `${DIR}/*.sql`)
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter(([status]) => !status?.startsWith('A'))
    .map((parts) => parts.join(' '));

const check = (base: string | undefined) => {
  if (!base || /^0+$/.test(base)) {
    say('No base commit (new branch): nothing to compare.');

    return;
  }

  if (!commitExists(base)) {
    say(`Base ${base} is not in this checkout: nothing to compare.`);

    return;
  }

  const before = journal(base);
  const after = journal('HEAD');

  const problems = [
    ...changedFiles(base),
    ...before.flatMap((tag, index) =>
      after[index] === tag ? [] : [`journal: ${tag} is no longer entry ${index}`],
    ),
  ];

  if (problems.length) {
    process.stderr.write(
      `Applied migrations were changed. Add a new migration instead:\n${problems.map((problem) => `  ${problem}\n`).join('')}`,
    );
    process.exitCode = 1;

    return;
  }

  say(`Migrations: ${before.length} applied unchanged, ${after.length - before.length} new.`);
};

check(process.argv[2]);
