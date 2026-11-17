import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  createIssue,
  ensureLabel,
  lastAuthors,
  openIssues,
  updateIssue,
  comment,
  upsertComment,
} from './github.ts';
import {
  type Authors,
  byArea,
  env,
  missed,
  notImported,
  ref,
  rows,
  runUrl,
  scoreLine,
  summary,
  untested,
  weakTestsSection,
} from './markdown.ts';
import {
  mergeReports,
  type Mutant,
  mutantsOf,
  plannedFiles,
  tally,
  type Test,
  testsOf,
  withoutUnsure,
} from './results.ts';

const LABEL = 'false-test';
const AREA_MARKER = 'erxes-mutation-area:';
const PR_MARKER = '<!-- erxes-mutation-pr -->';

const authorsOf = async (mutants: Mutant[]): Promise<Authors> => {
  const testFiles = new Set(
    mutants.filter(missed).flatMap((mutant) => mutant.testFiles.slice(0, 1)),
  );

  return lastAuthors([...testFiles], ref).catch((error: unknown) => {
    process.stdout.write(`::warning::Could not look up who changed the tests: ${String(error)}\n`);

    return new Map();
  });
};

const issueBody = (area: string, mutants: Mutant[], authors: Authors, tests: Map<string, Test>) =>
  [
    'Tests run over this code and still pass when it changes, so they do not check what it does. Each row is one change no test caught. Make a test fail for it; the next run closes this issue.',
    '',
    scoreLine(mutants),
    '',
    weakTestsSection(mutants, tests),
    '',
    '#### Changes no test caught',
    '',
    rows(mutants.filter(missed), area, authors),
    '',
    untested(mutants),
    '',
    `<!-- ${AREA_MARKER} ${area} -->`,
  ].join('\n');

/** A body without the run link and the commit in its line links, which change every run. */
const unpinned = (body: string) =>
  body.replaceAll(/\/actions\/runs\/\d+/g, '').replaceAll(/\/blob\/[0-9a-f]{40}\//g, '/blob/');

const closing = (inArea: Mutant[] | undefined) => {
  const run = `[run](${runUrl})`;

  if (!inArea)
    return {
      reason: 'not_planned',
      text: `This code is no longer mutation tested: moved, removed or left out (${run}).`,
    };

  const { killed, noCoverage } = tally(inArea);

  if (!killed)
    return {
      reason: 'not_planned',
      text: `No test runs this code any more, so none can be judged: ${noCoverage} changes sit in untested code (${run}).`,
    };

  const untestedNote = noCoverage ? ` ${noCoverage} more sit in code no test runs.` : '';

  return {
    reason: 'completed',
    text: `Every change the tests run over is caught now (${ref.slice(0, 12)}, ${run}).${untestedNote}`,
  };
};

const areaOf = (body: string) => new RegExp(String.raw`${AREA_MARKER} (\S+)`).exec(body)?.[1] ?? '';

const fileIssues = async (mutants: Mutant[], tests: Map<string, Test>) => {
  await ensureLabel(LABEL, 'Tests that pass whatever the code does (mutation testing)');

  const open = new Map(
    (await openIssues(LABEL)).flatMap((issue) => {
      const area = areaOf(issue.body);

      return area ? [[area, issue] as const] : [];
    }),
  );

  const areas = new Map(byArea(mutants));
  const authors = await authorsOf(mutants);
  const counts = { opened: 0, updated: 0, closed: 0 };

  for (const [area, inArea] of areas) {
    if (!inArea.some(missed)) continue;

    const title = `False tests in ${area}`;
    const body = issueBody(area, inArea, authors, tests);
    const existing = open.get(area);

    open.delete(area);

    if (!existing) {
      await createIssue(title, body, LABEL);
      counts.opened += 1;
    } else if (existing.title !== title || unpinned(existing.body) !== unpinned(body)) {
      await updateIssue(existing.number, { title, body });
      counts.updated += 1;
    }
  }

  const unsureAreas = new Set(tally(mutants).brokenSetup.map((mutant) => mutant.area));

  for (const [area, issue] of open) {
    if (unsureAreas.has(area)) continue;

    const { reason, text } = closing(areas.get(area));

    await comment(issue.number, text);
    await updateIssue(issue.number, { state: 'closed', state_reason: reason });
    counts.closed += 1;
  }

  return counts;
};

const verdict = async (mutants: Mutant[]) => {
  const misses = mutants.filter(missed);

  if (misses.length)
    return `#### Changes no test caught\n\n${misses.length} changes passed every test that ran over them:\n\n${rows(misses, '.', await authorsOf(mutants))}`;

  return tally(mutants).killed
    ? 'Every change tested here made a test fail.'
    : 'No test runs this code, so no test can be judged here.';
};

const prComment = async (mutants: Mutant[], untestedFiles: string[], tests: Map<string, Test>) => {
  const tested = tally(mutants).score !== null;

  const body = [
    PR_MARKER,
    '### Do the tests catch changes to the code this pull request touches?',
    '',
    tested ? scoreLine(mutants) : `[Run and HTML report](${runUrl})`,
    '',
    weakTestsSection(mutants, tests),
    '',
    await verdict(mutants),
    '',
    untested(mutants),
    '',
    notImported(untestedFiles),
    '',
    'This check reports; it does not block the merge.',
  ].join('\n');

  await upsertComment(Number(env('PR_NUMBER')), PR_MARKER, body).catch((error: unknown) => {
    process.stdout.write(`::warning::Could not comment on the pull request: ${String(error)}\n`);
  });
};

const plan = plannedFiles(env('PLAN'));
const out = env('MERGED_OUT');
const previous: unknown = out && existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;

const {
  merged,
  reports,
  untested: untestedFiles,
} = mergeReports(env('REPORTS_DIR'), plan, previous);

if (out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(withoutUnsure(merged)));
}

const mutants = mutantsOf(merged);
const tests = testsOf(merged);
const { brokenSetup, setupBroke } = tally(mutants);

if (env('GITHUB_STEP_SUMMARY')) appendFileSync(env('GITHUB_STEP_SUMMARY'), `${summary(mutants)}\n`);

process.stdout.write(`${summary(mutants)}\n`);

for (const mutant of brokenSetup.slice(0, 20))
  process.stdout.write(
    `::warning file=${mutant.file},line=${mutant.line}::A test failed with its setup, not an assertion, so this change counts as neither caught nor missed: ${mutant.reason.slice(0, 200)}\n`,
  );

if (setupBroke)
  throw new Error(
    `${brokenSetup.length} changes failed only because the test setup broke; the results can't be trusted.`,
  );

const complete =
  env('MUTATE_RESULT') === 'success' &&
  plan.size > 0 &&
  reports === plan.size &&
  mutants.length > 0;

if (untestedFiles.length) process.stdout.write(`${notImported(untestedFiles)}\n`);

if (env('MODE') === 'pr') await prComment(mutants, untestedFiles, tests);
else if (env('ISSUES') !== 'true') {
  process.stdout.write("Only the issue branch's runs keep the issues.\n");
} else if (!complete) {
  process.stdout.write(
    '::warning::A shard did not finish, or no test ran at all, so the issues stay as they were.\n',
  );
} else {
  const counts = await fileIssues(mutants, tests);

  process.stdout.write(
    `Issues: ${counts.opened} opened, ${counts.updated} updated, ${counts.closed} closed\n`,
  );
}
