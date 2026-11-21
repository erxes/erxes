import { appendFileSync, globSync, readFileSync } from 'node:fs';
import { matchesGlob } from 'node:path';

const lines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

const patterns = lines(process.env.MUTATE ?? '');
const include = patterns.filter((pattern) => !pattern.startsWith('!'));
const exclude = patterns.filter((pattern) => pattern.startsWith('!')).map((p) => p.slice(1));

if (!include.length) throw new Error('MUTATE names no files: give it one glob per line.');

const mutated = (file: string) =>
  include.some((pattern) => matchesGlob(file, pattern)) &&
  !exclude.some((pattern) => matchesGlob(file, pattern));

/** A file to mutate: all of it, or only the lines a pull request adds (`added`). */
type Target = { file: string; added: number[] | null };

/** The lines each file gains in a `git diff --unified=0`, by its new path. */
const addedLines = (diff: string) => {
  const added = new Map<string, number[]>();
  let file: string | null = null;
  let inHunk = false;
  let next = 0;

  for (const line of diff.split('\n')) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);

    if (line.startsWith('diff --git ')) {
      file = null;
      inHunk = false;
    } else if (!inHunk && line.startsWith('+++ ')) {
      file = line.startsWith('+++ b/') ? line.slice('+++ b/'.length) : null;
    } else if (hunk) {
      inHunk = true;
      next = Number(hunk[1]);
    } else if (inHunk && file && line.startsWith('+')) {
      added.set(file, [...(added.get(file) ?? []), next]);
      next += 1;
    }
  }

  return added;
};

const rangesOf = (added: number[]) => {
  const ranges: [number, number][] = [];

  for (const line of added) {
    const last = ranges.at(-1);

    if (last && line === last[1] + 1) last[1] = line;
    else ranges.push([line, line]);
  }

  return ranges;
};

const changesDiff = process.env.CHANGES_DIFF;

const targets: Target[] = changesDiff
  ? [...addedLines(readFileSync(changesDiff, 'utf8'))]
      .filter(([file]) => mutated(file))
      .map(([file, added]) => ({ file, added }))
  : globSync(include, { exclude })
      .filter(mutated)
      .map((file) => ({ file, added: null }));

const weightOf = ({ file, added }: Target) =>
  added?.length ?? readFileSync(file, 'utf8').split('\n').length;

const mutateOf = ({ file, added }: Target) =>
  added ? rangesOf(added).map(([start, end]) => `${file}:${start}-${end}`) : [file];

const perShard = Number(process.env.FILES_PER_SHARD ?? '0');
const wanted = perShard > 0 ? Math.ceil(targets.length / perShard) : targets.length;
const shardCount = Math.max(1, Math.min(Number(process.env.SHARDS ?? '1'), wanted));

const newShard = (shard: number) => ({ shard, weight: 0, targets: new Array<Target>() });

const first = newShard(1);

const shards = [
  first,
  ...Array.from({ length: shardCount - 1 }, (_, index) => newShard(index + 2)),
];

const byWeight = targets
  .map((target) => ({ target, weight: weightOf(target) }))
  .toSorted((a, b) => b.weight - a.weight || a.target.file.localeCompare(b.target.file));

for (const { target, weight } of byWeight) {
  const lightest = shards.reduce((min, shard) => (shard.weight < min.weight ? shard : min), first);

  lightest.targets.push(target);
  lightest.weight += weight;
}

const matrix = shards
  .filter((shard) => shard.targets.length)
  .map((shard) => {
    const sorted = shard.targets.toSorted((a, b) => a.file.localeCompare(b.file));

    return {
      shard: shard.shard,
      files: sorted.map((target) => target.file).join(','),
      mutate: sorted.flatMap(mutateOf).join(','),
    };
  });

const output = process.env.GITHUB_OUTPUT;

if (output) {
  appendFileSync(output, `matrix=${JSON.stringify(matrix)}\n`);
  appendFileSync(output, `count=${targets.length}\n`);
}

const lineCount = byWeight.reduce((sum, { weight }) => sum + weight, 0);

process.stdout.write(
  `${targets.length} files (${lineCount} lines) to mutate in ${matrix.length} shard(s)\n`,
);
