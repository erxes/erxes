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

  return {
    reports: reports.length,
    merged: {
      ...reports[0],
      files: Object.fromEntries(reports.flatMap((report) => Object.entries(json(report.files)))),
      testFiles: Object.fromEntries(
        reports.flatMap((report) => Object.entries(json(report.testFiles))),
      ),
    },
  };
};

const snippet = (source: string[], start: Json, end: Json) => {
  const from = count(start.line) - 1;
  const to = count(end.line) - 1;
  const first = source[from] ?? '';

  if (from !== to) return `${first.slice(count(start.column) - 1).trim()} …`;

  return first.slice(count(start.column) - 1, count(end.column) - 1);
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
          area: dirname(file),
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
 * A kill that came from the test setup breaking (the database gone, a hook timing out),
 * not from an assertion: such a mutant was never really tested.
 */
const BROKEN_SETUP =
  /ECONNREFUSED|ECONNRESET|too many clients|terminating connection|Connection terminated|database "[^"]+" does not exist|Hook timed out|hookTimeout|getaddrinfo/i;

export const tally = (mutants: Mutant[]) => {
  const of = (status: Status) => mutants.filter((mutant) => mutant.status === status).length;
  const killed = of('Killed');
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
    brokenSetup: mutants.filter(
      (mutant) => mutant.status === 'Killed' && BROKEN_SETUP.test(mutant.reason),
    ),
    score: tested ? Math.floor((killed / tested) * 1000) / 10 : null,
  };
};
