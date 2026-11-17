import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import {
  createIssue,
  ensureLabel,
  lastAuthor,
  openIssues,
  updateIssue,
  comment,
  upsertComment,
} from './github.ts';
import { mergeReports, type Mutant, mutantsOf, tally } from './results.ts';

const env = (name: string) => process.env[name] ?? '';

const LABEL = 'false-test';
const AREA_MARKER = 'erxes-mutation-area:';
const PR_MARKER = '<!-- erxes-mutation-pr -->';
const MAX_ROWS = 40;

const server = env('GITHUB_SERVER_URL') || 'https://github.com';
const repository = env('GITHUB_REPOSITORY');
const ref = env('HEAD_SHA') || env('GITHUB_SHA');
const runUrl = `${server}/${repository}/actions/runs/${env('GITHUB_RUN_ID')}`;

const code = (value: string) => {
  const flat = value.replaceAll(/\s+/g, ' ').trim();
  const short = flat.length > 70 ? `${flat.slice(0, 69)}…` : flat;
  const safe = short.replaceAll('|', '\\|');

  return safe.includes('`') ? `\`\` ${safe} \`\`` : `\`${safe || ' '}\``;
};

const authors = new Map<string, string>();

const authorOf = async (testFile: string) => {
  if (!authors.has(testFile))
    authors.set(testFile, await lastAuthor(testFile, ref).catch(() => ''));

  return authors.get(testFile) ?? '';
};

const rows = async (survivors: Mutant[], area: string) => {
  const lines = [
    '| Line | Change no test caught | Tests that ran over it | Test last changed by |',
  ];

  lines.push('|---|---|---|---|');

  for (const mutant of survivors.slice(0, MAX_ROWS)) {
    const where = `[${relative(area, mutant.file)}:${mutant.line}](${server}/${repository}/blob/${ref}/${mutant.file}#L${mutant.line})`;
    const tests = mutant.testFiles.slice(0, 2).map((file) => code(file.split('/').at(-1) ?? file));
    const author = mutant.testFiles[0] ? await authorOf(mutant.testFiles[0]) : '';

    lines.push(
      `| ${where} | ${code(mutant.original)} → ${code(mutant.replacement)} | ${tests.join(', ')} | ${author ? code(author) : ''} |`,
    );
  }

  if (survivors.length > MAX_ROWS)
    lines.push('', `And ${survivors.length - MAX_ROWS} more in the [HTML report](${runUrl}).`);

  return lines.join('\n');
};

const scoreLine = (mutants: Mutant[]) => {
  const { killed, survived, timeout, score } = tally(mutants);

  return `**Score: ${score ?? '–'}%** (${killed} of ${killed + survived + timeout} changes caught) · [run and HTML report](${runUrl})`;
};

const untested = (mutants: Mutant[]) => {
  const { noCoverage } = tally(mutants);

  return noCoverage
    ? `${noCoverage} more changes sit in code no test runs at all: missing tests, not false ones. The HTML report lists them.`
    : '';
};

const issueBody = async (area: string, mutants: Mutant[]) => {
  const survivors = mutants.filter((mutant) => mutant.status === 'Survived');

  return [
    'Tests run over this code and still pass when it changes, so they do not check what it does. Each row is one change no test caught. Make a test fail for it; the next run closes this issue.',
    '',
    scoreLine(mutants),
    '',
    await rows(survivors, area),
    '',
    untested(mutants),
    '',
    `<!-- ${AREA_MARKER} ${area} -->`,
  ].join('\n');
};

const byArea = (mutants: Mutant[]) => {
  const areas = new Map<string, Mutant[]>();

  for (const mutant of mutants) areas.set(mutant.area, [...(areas.get(mutant.area) ?? []), mutant]);

  return [...areas.entries()].toSorted(([a], [b]) => a.localeCompare(b));
};

const areaOf = (body: string) => body.match(new RegExp(`${AREA_MARKER} (\\S+)`))?.[1] ?? '';

const fileIssues = async (mutants: Mutant[]) => {
  await ensureLabel(LABEL, 'Tests that pass whatever the code does (mutation testing)');

  const open = new Map((await openIssues(LABEL)).map((issue) => [areaOf(issue.body), issue]));
  const counts = { opened: 0, updated: 0, closed: 0 };

  for (const [area, inArea] of byArea(mutants)) {
    if (!inArea.some((mutant) => mutant.status === 'Survived')) continue;

    const title = `False tests in ${area}`;
    const body = await issueBody(area, inArea);
    const existing = open.get(area);

    open.delete(area);

    if (!existing) {
      await createIssue(title, body, LABEL);
      counts.opened += 1;
    } else if (existing.body !== body) {
      await updateIssue(existing.number, { title, body });
      counts.updated += 1;
    }
  }

  for (const issue of open.values()) {
    await comment(
      issue.number,
      `Every change in this code is caught by a test now (${ref.slice(0, 12)}, [run](${runUrl})).`,
    );
    await updateIssue(issue.number, { state: 'closed', state_reason: 'completed' });
    counts.closed += 1;
  }

  return counts;
};

const prComment = async (mutants: Mutant[]) => {
  const survivors = mutants.filter((mutant) => mutant.status === 'Survived');

  const body = [
    PR_MARKER,
    '### Do the tests catch changes to the code this pull request touches?',
    '',
    scoreLine(mutants),
    '',
    survivors.length
      ? `${survivors.length} changes passed every test that ran over them:\n\n${await rows(survivors, '.')}`
      : 'Every change tested here made a test fail.',
    '',
    untested(mutants),
    '',
    'This check reports; it does not block the merge.',
  ].join('\n');

  await upsertComment(Number(env('PR_NUMBER')), PR_MARKER, body).catch((error: unknown) => {
    process.stdout.write(`::warning::Could not comment on the pull request: ${String(error)}\n`);
  });
};

const summary = (mutants: Mutant[]) => {
  const lines = [
    '| Area | Score | Caught | Not caught | Timed out | No test runs it |',
    '|---|---|---|---|---|---|',
  ];

  for (const [area, inArea] of byArea(mutants)) {
    const t = tally(inArea);

    lines.push(
      `| ${area} | ${t.score ?? '–'}% | ${t.killed} | ${t.survived} | ${t.timeout} | ${t.noCoverage} |`,
    );
  }

  const all = tally(mutants);

  return [
    '## Mutation testing',
    '',
    `Score ${all.score ?? '–'}%: ${all.killed} caught, ${all.survived} not caught, ${all.timeout} timed out, ${all.noCoverage} in untested code, ${all.ignored} ignored, ${all.errors} errors.`,
    '',
    ...lines,
  ].join('\n');
};

const { merged, reports } = mergeReports(env('REPORTS_DIR'));
const out = env('MERGED_OUT');

if (out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(merged));
}

const mutants = mutantsOf(merged);
const { brokenSetup } = tally(mutants);

if (env('GITHUB_STEP_SUMMARY')) appendFileSync(env('GITHUB_STEP_SUMMARY'), `${summary(mutants)}\n`);

process.stdout.write(`${summary(mutants)}\n`);

if (brokenSetup.length) {
  for (const mutant of brokenSetup.slice(0, 20))
    process.stdout.write(
      `::error file=${mutant.file},line=${mutant.line}::Killed by a broken test setup, not an assertion: ${mutant.reason.slice(0, 200)}\n`,
    );

  throw new Error(
    `${brokenSetup.length} mutants were "killed" by a broken setup; the results can't be trusted.`,
  );
}

const expected: unknown = env('EXPECTED_REPORTS') ? JSON.parse(env('EXPECTED_REPORTS')) : [];
const complete = Array.isArray(expected) && expected.length > 0 && expected.length === reports;

if (env('MODE') === 'pr') await prComment(mutants);
else if (env('MODE') === 'full' && !complete) {
  process.stdout.write('::warning::A shard did not finish, so the issues stay as they were.\n');
} else if (env('MODE') === 'full') {
  const counts = await fileIssues(mutants);

  process.stdout.write(
    `Issues: ${counts.opened} opened, ${counts.updated} updated, ${counts.closed} closed\n`,
  );
}
