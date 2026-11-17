import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { type Mutant, tally, type Test, thresholdsOf, unsure } from './results.ts';

export const env = (name: string) => process.env[name] ?? '';

const MAX_ROWS = 40;
const MAX_TESTS = 3;
const MAX_TEST_LINES = 15;

const server = env('GITHUB_SERVER_URL') || 'https://github.com';
const repository = env('GITHUB_REPOSITORY');

export const ref = env('HEAD_SHA') || env('GITHUB_SHA');
export const runUrl = `${server}/${repository}/actions/runs/${env('GITHUB_RUN_ID')}`;

const blob = (file: string, line: number) => `${server}/${repository}/blob/${ref}/${file}#L${line}`;

export const code = (value: string) => {
  const flat = value.replaceAll(/\s+/g, ' ').trim();
  const short = flat.length > 70 ? `${flat.slice(0, 69)}…` : flat;
  const safe = short.replaceAll('|', '\\|');

  return safe.includes('`') ? `\`\` ${safe} \`\`` : `\`${safe || ' '}\``;
};

/** A change the tests ran over and did not fail on, or only timed out on. */
export const missed = (mutant: Mutant) =>
  mutant.status === 'Survived' || mutant.status === 'Timeout';

export type Authors = Map<string, string>;

export const rows = (misses: Mutant[], area: string, authors: Authors) => {
  const lines = [
    '| Line | Change no test caught | Tests that ran over it | Test last changed by |',
    '|---|---|---|---|',
  ];

  for (const mutant of misses.slice(0, MAX_ROWS)) {
    const where = `[${relative(area, mutant.file)}:${mutant.line}](${blob(mutant.file, mutant.line)})`;
    const change = `${code(mutant.original)} → ${code(mutant.replacement)}${mutant.status === 'Timeout' ? ' (the tests only timed out)' : ''}`;
    const tests = mutant.testFiles.slice(0, 2).map((file) => code(file.split('/').at(-1) ?? file));
    const author = authors.get(mutant.testFiles[0] ?? '') ?? '';

    lines.push(`| ${where} | ${change} | ${tests.join(', ')} | ${author ? code(author) : ''} |`);
  }

  if (misses.length > MAX_ROWS)
    lines.push('', `And ${misses.length - MAX_ROWS} more in the [HTML report](${runUrl}).`);

  return lines.join('\n');
};

const { high, low } = thresholdsOf(
  JSON.parse(readFileSync(new URL('stryker.json', import.meta.url), 'utf8')),
);

const rating = (score: number | null) => {
  if (score === null) return { dot: '⚪', word: 'Nothing to judge' };

  if (score >= high) return { dot: '🟢', word: 'Good tests' };

  return score >= low ? { dot: '🟡', word: 'Fair tests' } : { dot: '🔴', word: 'Weak tests' };
};

const grade = (score: number | null) => {
  const { dot, word } = rating(score);

  return `${dot} ${word}`;
};

export const scoreLine = (mutants: Mutant[]) => {
  const { killed, survived, timeout, score } = tally(mutants);

  const timeouts = timeout
    ? `; ${timeout} that only made the tests time out count as not caught`
    : '';

  return `**${grade(score)}: ${score ?? '–'}%** (${killed} of ${killed + survived + timeout} changes caught${timeouts}; good is ${high}%+) · [run and HTML report](${runUrl})`;
};

/**
 * The tests that ran over changes which then passed every test, most first. Such a change surely
 * got past each test that ran over it; Stryker stops at the first test that fails, so a catch
 * is not counted for the others.
 */
const weakTests = (mutants: Mutant[], tests: Map<string, Test>) => {
  const counts = new Map<string, { ran: number; let: number }>();

  for (const mutant of mutants) {
    if ((mutant.status !== 'Killed' && !missed(mutant)) || unsure(mutant)) continue;

    for (const id of mutant.tests) {
      const seen = counts.get(id) ?? { ran: 0, let: 0 };

      counts.set(id, { ran: seen.ran + 1, let: seen.let + (missed(mutant) ? 1 : 0) });
    }
  }

  return [...counts]
    .flatMap(([id, seen]) => {
      const test = tests.get(id);

      return test && seen.let ? [{ test, ...seen }] : [];
    })
    .toSorted((a, b) => b.let - a.let || b.ran - a.ran);
};

/** The test's own lines, from its `it(` or `test(` to its closing `})`, at most 15. */
const testCode = ({ source, line }: Test) => {
  const first = source[line - 1] ?? '';
  const indent = first.length - first.trimStart().length;
  const lines = [first];

  for (const next of source.slice(line, line - 1 + MAX_TEST_LINES)) {
    lines.push(next);

    if (next.length - next.trimStart().length === indent && next.trimStart().startsWith('})'))
      return lines.map((text) => text.slice(indent));
  }

  return [...lines.map((text) => text.slice(indent)), '  …'];
};

export const weakTestsSection = (mutants: Mutant[], tests: Map<string, Test>) => {
  const weak = weakTests(mutants, tests);

  if (!weak.length) return '';

  return [
    '#### Tests that let changes through',
    '',
    ...weak.slice(0, MAX_TESTS).flatMap(({ test, ran, let: through }) => {
      const score = Math.floor(((ran - through) / ran) * 1000) / 10;
      const fence = test.source.join('\n').includes('```') ? '~~~' : '```';
      const where = `[${test.file.split('/').at(-1)}:${test.line}](${blob(test.file, test.line)})`;

      return [
        `${rating(score).dot} ${code(test.name)} · ${where}`,
        `**${score}%**: of the ${ran} changes it ran over, ${through} passed it and every other test.`,
        '',
        `${fence}ts`,
        ...testCode(test),
        fence,
        '',
      ];
    }),
    weak.length > MAX_TESTS ? `And ${weak.length - MAX_TESTS} more tests let changes through.` : '',
  ].join('\n');
};

export const untested = (mutants: Mutant[]) => {
  const { noCoverage } = tally(mutants);

  return noCoverage
    ? `${noCoverage} more changes sit in code no test runs at all: missing tests, not false ones. The HTML report lists them.`
    : '';
};

export const notImported = (files: string[]) =>
  files.length
    ? `No test imports ${files.length} of the changed files: ${files.slice(0, 10).map(code).join(', ')}${files.length > 10 ? ' …' : ''}`
    : '';

export const byArea = (mutants: Mutant[]) => {
  const areas = new Map<string, Mutant[]>();

  for (const mutant of mutants) areas.set(mutant.area, [...(areas.get(mutant.area) ?? []), mutant]);

  return [...areas.entries()].toSorted(([a], [b]) => a.localeCompare(b));
};

export const summary = (mutants: Mutant[]) => {
  const lines = [
    '| Area | Score | Caught | Not caught | Timed out | No test runs it |',
    '|---|---|---|---|---|---|',
  ];

  for (const [area, inArea] of byArea(mutants)) {
    const t = tally(inArea);

    lines.push(
      `| ${area} | ${rating(t.score).dot} ${t.score ?? '–'}% | ${t.killed} | ${t.survived} | ${t.timeout} | ${t.noCoverage} |`,
    );
  }

  const all = tally(mutants);

  return [
    '## Mutation testing',
    '',
    `${grade(all.score)}: ${all.score ?? '–'}%: ${all.killed} caught, ${all.survived} not caught, ${all.timeout} timed out, ${all.noCoverage} in untested code, ${all.ignored} ignored, ${all.errors} errors, ${all.brokenSetup.length} unsure (the setup broke).`,
    '',
    ...lines,
  ].join('\n');
};
