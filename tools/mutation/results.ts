import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Json = Record<string, unknown>;

const isJson = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const json = (value: unknown): Json => (isJson(value) ? value : {});

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const count = (value: unknown) => (typeof value === 'number' ? value : 0);

export type Status =
  | 'Killed'
  | 'Survived'
  | 'NoCoverage'
  | 'Timeout'
  | 'RuntimeError'
  | 'CompileError'
  | 'Ignored'
  | 'Pending';

const STATUSES = new Set<string>([
  'Killed',
  'Survived',
  'NoCoverage',
  'Timeout',
  'RuntimeError',
  'CompileError',
  'Ignored',
  'Pending',
]);

const isStatus = (value: string): value is Status => STATUSES.has(value);

export type Mutant = {
  file: string;
  area: string;
  line: number;
  mutator: string;
  original: string;
  replacement: string;
  status: Status;
  reason: string;
  testFiles: string[];
};

/** The shard reports (mutation.json) under `dir`, merged into one Stryker report. */
export const mergeReports = (dir: string) => {
  const reports = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('mutation.json') && statSync(join(dir, path)).isFile())
    .map((path): Json => json(JSON.parse(readFileSync(join(dir, path), 'utf8'))));

  if (!reports.length) throw new Error(`No mutation.json under ${dir}: did every shard fail?`);

  const shards = reports.map(withStableTestIds);
  const testFiles = new Map<string, Map<string, Json>>();

  for (const shard of shards)
    for (const [path, tests] of shard.testFiles)
      for (const test of tests)
        testFiles.set(
          path,
          (testFiles.get(path) ?? new Map<string, Json>()).set(text(test.id), test),
        );

  return {
    reports: reports.length,
    merged: {
      ...reports[0],
      files: Object.fromEntries(shards.flatMap((shard) => shard.files)),
      testFiles: Object.fromEntries(
        [...testFiles].map(([path, tests]) => [path, { tests: [...tests.values()] }]),
      ),
    },
  };
};

/**
 * Stryker numbers a run's tests from 0, so two shards' ids collide. This names each test by its
 * file and full name instead, the same in every shard, and rewrites the mutants to match.
 */
const withStableTestIds = (report: Json) => {
  const stable = new Map<string, string>();

  const testFiles = Object.entries(json(report.testFiles)).map(([path, entry]) => {
    const tests = list(json(entry).tests).map((raw) => {
      const test = json(raw);
      const id = `${path}#${text(test.name)}`;

      stable.set(text(test.id), id);

      return { ...test, id };
    });

    return [path, tests] as const;
  });

  const remap = (ids: unknown) =>
    Array.isArray(ids) ? ids.map((id) => stable.get(text(id)) ?? text(id)) : undefined;

  const files = Object.entries(json(report.files)).map(([path, entry]) => {
    const file = json(entry);

    const mutants = list(file.mutants).map((raw) => {
      const mutant = json(raw);

      return { ...mutant, coveredBy: remap(mutant.coveredBy), killedBy: remap(mutant.killedBy) };
    });

    return [path, { ...file, mutants }] as const;
  });

  return { testFiles, files };
};

const snippet = (source: string[], start: Json, end: Json) => {
  const from = count(start.line) - 1;
  const to = count(end.line) - 1;
  const first = source[from] ?? '';

  if (from !== to) return `${first.slice(count(start.column) - 1).trim()} …`;

  return first.slice(count(start.column) - 1, count(end.column) - 1);
};

/**
 * The feature a file belongs to, which gets one issue: `…/modules/<name>`, or else the folder
 * under `src` (`apps/api/src/lib`), or `src` itself for a file directly in it.
 */
const areaOf = (file: string) => {
  const parts = file.split('/');
  const modules = parts.indexOf('modules');

  if (modules >= 0 && modules + 2 < parts.length) return parts.slice(0, modules + 2).join('/');

  const src = parts.indexOf('src');

  if (src < 0) return dirname(file);

  return parts.slice(0, Math.min(src + 2, parts.length - 1)).join('/');
};

/** Every mutant in a merged report, with the test files that ran over it. */
export const mutantsOf = (report: Json) => {
  const fileOfTest = new Map<string, string>();

  for (const [path, entry] of Object.entries(json(report.testFiles)))
    for (const test of list(json(entry).tests)) fileOfTest.set(text(json(test).id), path);

  return Object.entries(json(report.files)).flatMap(([file, entry]) => {
    const source = text(json(entry).source).split('\n');

    return list(json(entry).mutants).flatMap((raw): Mutant[] => {
      const mutant = json(raw);
      const status = text(mutant.status);
      const { start, end } = json(mutant.location);
      const tests = list(mutant.coveredBy).map((id) => fileOfTest.get(text(id)) ?? '');

      if (!isStatus(status)) return [];

      return [
        {
          file,
          area: areaOf(file),
          line: count(json(start).line),
          mutator: text(mutant.mutatorName),
          original: snippet(source, json(start), json(end)),
          replacement: text(mutant.replacement),
          status,
          reason: text(mutant.statusReason),
          testFiles: [...new Set(tests.filter(Boolean))].toSorted(),
        },
      ];
    });
  });
};

/**
 * A kill that came with the test setup breaking (a connection dropped, a hook timing out), not a
 * failed assertion. Changed code can end that way too, so such a mutant counts as neither caught
 * nor missed; many of them mean the setup itself broke.
 */
const BROKEN_SETUP =
  /ECONNREFUSED|ECONNRESET|too many clients|terminating connection|Connection terminated|database "[^"]+" does not exist|Hook timed out|hookTimeout|getaddrinfo/i;

const unsure = (mutant: Mutant) => mutant.status === 'Killed' && BROKEN_SETUP.test(mutant.reason);

export const tally = (mutants: Mutant[]) => {
  const of = (status: Status) => mutants.filter((mutant) => mutant.status === status).length;
  const brokenSetup = mutants.filter(unsure);
  const killed = of('Killed') - brokenSetup.length;
  const survived = of('Survived');
  const timeout = of('Timeout');
  const tested = killed + survived + timeout;

  return {
    killed,
    survived,
    timeout,
    noCoverage: of('NoCoverage'),
    errors: of('RuntimeError') + of('CompileError'),
    ignored: of('Ignored'),
    brokenSetup,
    setupBroke: brokenSetup.length > Math.max(5, killed / 200),
    score: tested ? Math.floor((killed / tested) * 1000) / 10 : null,
  };
};
