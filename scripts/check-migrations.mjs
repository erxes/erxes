#!/usr/bin/env node
/**
 * Applied migrations never change: fails when a migration that exists at the
 * base commit was edited, renamed or deleted, or when the journal no longer
 * lists it first-to-last in the same order. New migrations are fine.
 *   node scripts/check-migrations.mjs <base ref>
 */
import { execFileSync } from 'node:child_process';

const base = process.argv[2];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const DIR = 'packages/db/drizzle';

if (!base || /^0+$/.test(base)) {
  console.log('No base commit (new branch): nothing to compare.');
  process.exit(0);
}

try {
  git('cat-file', '-e', `${base}^{commit}`);
} catch {
  console.log(`Base ${base} is not in this checkout: nothing to compare.`);
  process.exit(0);
}

const problems = [];

for (const line of git('diff', '--name-status', `${base}`, 'HEAD', '--', `${DIR}/*.sql`)
  .split('\n')
  .filter(Boolean)) {
  const [status, file] = line.split('\t');

  if (!status.startsWith('A')) problems.push(`${status} ${file}`);
}

const journal = (ref) => {
  try {
    return JSON.parse(git('show', `${ref}:${DIR}/meta/_journal.json`)).entries.map(
      (entry) => entry.tag,
    );
  } catch {
    return [];
  }
};

const before = journal(base);
const after = journal('HEAD');

before.forEach((tag, index) => {
  if (after[index] !== tag) problems.push(`journal: ${tag} is no longer entry ${index}`);
});

if (problems.length) {
  console.error('Applied migrations were changed. Add a new migration instead:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`Migrations: ${before.length} applied unchanged, ${after.length - before.length} new.`);
