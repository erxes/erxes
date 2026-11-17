import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Json = Record<string, unknown>;

const isJson = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const json = (value: unknown): Json => (isJson(value) ? value : {});

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const count = (value: unknown) => (typeof value === 'number' ? value : 0);

/** The score lines from stryker.json: at `high` or above the tests are good, under `low` weak. */
export const thresholdsOf = (config: unknown) => {
  const thresholds = json(json(config).thresholds);

  return { high: count(thresholds.high), low: count(thresholds.low) };
};

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
  tests: string[];
};

export type Test = { id: string; file: string; name: string; line: number; source: string[] };

/** Each shard's files, from plan.ts's matrix: `[{ shard, files: 'a.ts,b.ts' }]`. */
export const plannedFiles = (matrix: string) => {
  const parsed: unknown = matrix ? JSON.parse(matrix) : [];

  return new Map(
    list(parsed).map((entry) => [
      count(json(entry).shard),
      new Set(text(json(entry).files).split(',').filter(Boolean)),
    ]),
  );
};

const shardOf = (path: string) => Number(/mutation-(\d+)/.exec(path)?.[1] ?? 0);

/**
 * The shard reports (`mutation-<shard>/mutation.json` under `dir`) merged into one Stryker
 * report. In incremental mode each shard also carries the last run's results for every other file,
 * so a file is taken only from the shard that mutated it. A shard that sent no report keeps its
 * files' results from `previous`, the last run's merged report. A shard whose files no test
 * imports sends an `untested` mark instead; those files come back in `untested`.
 */
export const mergeReports = (dir: string, plan: Map<number, Set<string>>, previous: unknown) => {
  const found = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((path) =>
    statSync(join(dir, path)).isFile(),
  );

  const paths = found.filter((path) => path.endsWith('mutation.json'));
  const untestedShards = new Set(found.filter((path) => path.endsWith('untested')).map(shardOf));

  if (!paths.length && !untestedShards.size)
    throw new Error(`No mutation.json under ${dir}: did every shard fail?`);

  const reports = paths.map((path) => ({
    shard: shardOf(path),
    report: json(JSON.parse(readFileSync(join(dir, path), 'utf8'))),
  }));

  const reported = new Set([...reports.map(({ shard }) => shard), ...untestedShards]);

  const untested = [...plan].flatMap(([shard, files]) =>
    untestedShards.has(shard) ? [...files] : [],
  );

  const unreported = new Set(
    [...plan].flatMap(([shard, files]) => (reported.has(shard) ? [] : [...files])),
  );

  const shards = [
    ...reports.map(({ shard, report }) => ({
      ...withStableTestIds(report),
      planned: plan.get(shard) ?? new Set<string>(),
    })),
    ...(unreported.size ? [{ ...withStableTestIds(json(previous)), planned: unreported }] : []),
  ];

  const testFiles = new Map<string, Json>();

  for (const shard of shards)
    for (const [path, entry] of shard.testFiles) {
      const tests = new Map(
        list(json(testFiles.get(path)).tests).map((t) => [text(json(t).id), t]),
      );

      for (const test of list(entry.tests)) tests.set(text(json(test).id), test);

      testFiles.set(path, { ...entry, ...testFiles.get(path), tests: [...tests.values()] });
    }

  return {
    reports: reported.size,
    untested,
    merged: {
      ...(reports[0]?.report ?? json(previous)),
      files: Object.fromEntries(
        shards.flatMap((shard) => shard.files.filter(([path]) => shard.planned.has(path))),
      ),
      testFiles: Object.fromEntries(testFiles),
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

    return [path, { ...json(entry), tests }] as const;
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

/** Every test in a merged report by id, with where it starts and its file's source. */
export const testsOf = (report: Json) =>
  new Map(
    Object.entries(json(report.testFiles)).flatMap(([file, entry]) => {
      const source = text(json(entry).source).split('\n');

      return list(json(entry).tests).map((raw): [string, Test] => {
        const test = json(raw);
        const id = text(test.id);
        const line = count(json(json(test.location).start).line);

        return [id, { id, file, name: text(test.name), line, source }];
      });
    }),
  );

/** Every mutant in a merged report, with the tests and test files that ran over it. */
export const mutantsOf = (report: Json) => {
  const tests = testsOf(report);

  return Object.entries(json(report.files)).flatMap(([file, entry]) => {
    const source = text(json(entry).source).split('\n');

    return list(json(entry).mutants).flatMap((raw): Mutant[] => {
      const mutant = json(raw);
      const status = text(mutant.status);
      const { start, end } = json(mutant.location);
      const covering = list(mutant.coveredBy).map((id) => text(id));
      const files = covering.map((id) => tests.get(id)?.file ?? '');

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
          testFiles: [...new Set(files.filter(Boolean))].toSorted((a, b) => a.localeCompare(b)),
          tests: covering,
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

export const unsure = (mutant: Mutant) =>
  mutant.status === 'Killed' && BROKEN_SETUP.test(mutant.reason);

/** The report to keep for the next run, without unsure kills, so those mutants run again. */
export const withoutUnsure = (report: Json) => ({
  ...report,
  files: Object.fromEntries(
    Object.entries(json(report.files)).map(([path, entry]) => [
      path,
      {
        ...json(entry),
        mutants: list(json(entry).mutants).filter((raw) => {
          const mutant = json(raw);

          return !(mutant.status === 'Killed' && BROKEN_SETUP.test(text(mutant.statusReason)));
        }),
      },
    ]),
  ),
});

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
