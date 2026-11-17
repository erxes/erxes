import { appendFileSync, globSync, readFileSync, statSync } from 'node:fs';
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

const changedList = process.env.CHANGED_FILES;

const files = changedList
  ? lines(readFileSync(changedList, 'utf8')).filter(mutated)
  : globSync(include, { exclude }).filter(mutated);

const shardCount = Math.max(1, Math.min(Number(process.env.SHARDS ?? '1'), files.length));

const newShard = (shard: number) => ({ shard, size: 0, files: new Array<string>() });

const first = newShard(1);

const shards = [
  first,
  ...Array.from({ length: shardCount - 1 }, (_, index) => newShard(index + 2)),
];

const bySize = files
  .map((file) => ({ file, size: statSync(file).size }))
  .toSorted((a, b) => b.size - a.size || a.file.localeCompare(b.file));

for (const { file, size } of bySize) {
  const lightest = shards.reduce((min, shard) => (shard.size < min.size ? shard : min), first);

  lightest.files.push(file);
  lightest.size += size;
}

const matrix = shards
  .filter((shard) => shard.files.length)
  .map((shard) => ({
    shard: shard.shard,
    files: shard.files.toSorted((a, b) => a.localeCompare(b)).join(','),
  }));

const output = process.env.GITHUB_OUTPUT;

if (output) {
  appendFileSync(output, `matrix=${JSON.stringify(matrix)}\n`);
  appendFileSync(output, `count=${files.length}\n`);
}

process.stdout.write(`${files.length} files to mutate in ${matrix.length} shard(s)\n`);
