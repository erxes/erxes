#!/usr/bin/env node
// A type written by hand next to the zod schema, table or value list it repeats compiles fine and
// goes stale on the next rename. This finds those copies across the repo, which a per-file lint
// rule can't, and names what to infer each one from.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { type Definition, type Kind, type Place, readFile } from './copies/read.ts';
import { projectFiles } from './project-files.ts';

/** Fewest fields a copy of a zod object, or of a table's columns, needs before it counts. */
const ZOD_FIELDS_MIN = 3;
const TABLE_FIELDS_MIN = 5;

const SKIPPED = /(^|\/)(__tests__|e2e|drizzle|dist|node_modules)\/|\.(test|spec|d)\.tsx?$/;

const Manifest = z.object({
  name: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
  peerDependencies: z.record(z.string(), z.string()).optional(),
});

/**
 * Whether one file can import from another: the same package, or a workspace package it depends
 * on. A copy of something it can't import is no copy it could avoid.
 */
const importability = (root: string, files: string[]) => {
  const packages = files
    .filter((file) => file === 'package.json' || file.endsWith('/package.json'))
    .map((file) => {
      const manifest = Manifest.parse(JSON.parse(readFileSync(join(root, file), 'utf8')));

      const uses = {
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.peerDependencies,
      };

      return {
        dir: file === 'package.json' ? '' : file.slice(0, -'/package.json'.length),
        name: manifest.name,
        uses: new Set(Object.keys(uses)),
      };
    })
    .toSorted((a, b) => b.dir.length - a.dir.length);

  const packageOf = (file: string) =>
    packages.find((candidate) => candidate.dir === '' || file.startsWith(`${candidate.dir}/`));

  return (from: string, source: string) => {
    const own = packageOf(from);
    const theirs = packageOf(source);

    return own === theirs || (theirs?.name !== undefined && own?.uses.has(theirs.name) === true);
  };
};

/** Every field of the copy is in the source, holding the same kind where both tell. */
const fits = (copy: Map<string, Kind>, source: Map<string, Kind>) =>
  [...copy].every(([name, kind]) => {
    const other = source.get(name);

    return other !== undefined && (kind === null || other === null || kind === other);
  });

const sameValues = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((value) => b.has(value));

const sourceName = (place: Place) =>
  place.name.startsWith('the one at') ? place.name : `${place.name} (${place.file}:${place.line})`;

/** Each hand-written type that repeats a zod object, a table's columns or a value list. */
export const findCopies = (root: string, excluded: string[] = []) => {
  const all = projectFiles(root);
  const reaches = importability(root, all);

  const read = all
    .filter(
      (file) =>
        /\.tsx?$/.test(file) &&
        !SKIPPED.test(file) &&
        !excluded.some((prefix) => file.startsWith(prefix)),
    )
    .map((file) => readFile(file, readFileSync(join(root, file), 'utf8')));

  const zodObjects = read.flatMap((file) => file.zodObjects);
  const tables = read.flatMap((file) => file.tables);
  const lists = read.flatMap((file) => file.lists);

  const repeats = (copy: Definition) => {
    const at = `${copy.file}:${copy.line}: ${copy.name}`;

    const usable = (source: Definition) =>
      fits(copy.fields, source.fields) && reaches(copy.file, source.file);

    const zod =
      copy.fields.size >= ZOD_FIELDS_MIN &&
      zodObjects.find((source) => source.fields.size === copy.fields.size && usable(source));

    if (zod) return [`${at} repeats the zod object ${sourceName(zod)}; use z.infer<typeof …>.`];

    const table = copy.fields.size >= TABLE_FIELDS_MIN && tables.find(usable);

    return table
      ? [
          `${at} repeats columns of the table ${sourceName(table)}; use Pick<typeof ….$inferSelect, …>.`,
        ]
      : [];
  };

  const listCopies = read
    .flatMap((file) => file.unions)
    .flatMap((union) => {
      const list = lists.find(
        (source) => sameValues(union.values, source.values) && reaches(union.file, source.file),
      );

      const use = list?.zod ? 'z.infer<typeof …>' : '(typeof …)[number]';

      return list
        ? [
            `${union.file}:${union.line}: ${union.name} repeats the list ${sourceName(list)}; use ${use}.`,
          ]
        : [];
    });

  return [...read.flatMap((file) => file.copies).flatMap(repeats), ...listCopies];
};

export const checkCopies = (excluded: string[] = []) => {
  const problems = findCopies(process.cwd(), excluded);

  for (const problem of problems) process.stderr.write(`${problem}\n`);

  if (problems.length > 0) {
    process.stderr.write(
      'check-copies: infer each type from its source instead of writing it again.\n',
    );
    process.exitCode = 1;
  }
};

if (import.meta.main) checkCopies();
