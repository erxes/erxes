import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
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
  mergeReports,
  type Mutant,
  mutantsOf,
  plannedFiles,
  tally,
  withoutUnsure,
} from './results.ts';

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

/** A change the tests ran over and did not fail on, or only timed out on. */
const missed = (mutant: Mutant) => mutant.status === 'Survived' || mutant.status === 'Timeout';

type Authors = Map<string, string>;

const authorsOf = async (mutants: Mutant[]): Promise<Authors> => {
  const testFiles = new Set(
    mutants.filter(missed).flatMap((mutant) => mutant.testFiles.slice(0, 1)),
  );

  return lastAuthors([...testFiles], ref).catch((error: unknown) => {
    process.stdout.write(`::warning::Could not look up who changed the tests: ${String(error)}\n`);

    return new Map();
  });
};

const rows = (misses: Mutant[], area: string, authors: Authors) => {
  const lines = [
    '| Line | Change no test caught | Tests that ran over it | Test last changed by |',
    '|---|---|---|---|',
  ];

  for (const mutant of misses.slice(0, MAX_ROWS)) {
    const where = `[${relative(area, mutant.file)}:${mutant.line}](${server}/${repository}/blob/${ref}/${mutant.file}#L${mutant.line})`;
    const change = `${code(mutant.original)} → ${code(mutant.replacement)}${mutant.status === 'Timeout' ? ' (the tests only timed out)' : ''}`;
    const tests = mutant.testFiles.slice(0, 2).map((file) => code(file.split('/').at(-1) ?? file));
    const author = authors.get(mutant.testFiles[0] ?? '') ?? '';

    lines.push(`| ${where} | ${change} | ${tests.join(', ')} | ${author ? code(author) : ''} |`);
  }

  if (misses.length > MAX_ROWS)
    lines.push('', `And ${misses.length - MAX_ROWS} more in the [HTML report](${runUrl}).`);

  return lines.join('\n');
};

const scoreLine = (mutants: Mutant[]) => {
  const { killed, survived, timeout, score } = tally(mutants);

  const timeouts = timeout
    ? `; ${timeout} that only made the tests time out count as not caught`
    : '';

  return `**Score: ${score ?? '–'}%** (${killed} of ${killed + survived + timeout} changes caught${timeouts}) · [run and HTML report](${runUrl})`;
};

const untested = (mutants: Mutant[]) => {
  const { noCoverage } = tally(mutants);

  return noCoverage
    ? `${noCoverage} more changes sit in code no test runs at all: missing tests, not false ones. The HTML report lists them.`
    : '';
};

const issueBody = (area: string, mutants: Mutant[], authors: Authors) =>
  [
    'Tests run over this code and still pass when it changes, so they do not check what it does. Each row is one change no test caught. Make a test fail for it; the next run closes this issue.',
    '',
    scoreLine(mutants),
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

const byArea = (mutants: Mutant[]) => {
  const areas = new Map<string, Mutant[]>();

  for (const mutant of mutants) areas.set(mutant.area, [...(areas.get(mutant.area) ?? []), mutant]);

  return [...areas.entries()].toSorted(([a], [b]) => a.localeCompare(b));
};

const areaOf = (body: string) => new RegExp(String.raw`${AREA_MARKER} (\S+)`).exec(body)?.[1] ?? '';

const fileIssues = async (mutants: Mutant[]) => {
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
    const body = issueBody(area, inArea, authors);
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

  for (const [area, issue] of open) {
    const { reason, text } = closing(areas.get(area));

    await comment(issue.number, text);
    await updateIssue(issue.number, { state: 'closed', state_reason: reason });
    counts.closed += 1;
  }

  return counts;
};

const prComment = async (mutants: Mutant[]) => {
  const misses = mutants.filter(missed);

  const body = [
    PR_MARKER,
    '### Do the tests catch changes to the code this pull request touches?',
    '',
    scoreLine(mutants),
    '',
    misses.length
      ? `${misses.length} changes passed every test that ran over them:\n\n${rows(misses, '.', await authorsOf(mutants))}`
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
    `Score ${all.score ?? '–'}%: ${all.killed} caught, ${all.survived} not caught, ${all.timeout} timed out, ${all.noCoverage} in untested code, ${all.ignored} ignored, ${all.errors} errors, ${all.brokenSetup.length} unsure (the setup broke).`,
    '',
    ...lines,
  ].join('\n');
};

const plan = plannedFiles(env('PLAN'));
const { merged, reports } = mergeReports(env('REPORTS_DIR'), plan);
const out = env('MERGED_OUT');

if (out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(withoutUnsure(merged)));
}

const mutants = mutantsOf(merged);
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

const complete = env('MUTATE_RESULT') === 'success' && plan.size > 0 && reports === plan.size;

if (env('MODE') === 'pr') await prComment(mutants);
else if (env('ISSUES') !== 'true') {
  process.stdout.write("Only the issue branch's runs keep the issues.\n");
} else if (!complete) {
  process.stdout.write('::warning::A shard did not finish, so the issues stay as they were.\n');
} else {
  const counts = await fileIssues(mutants);

  process.stdout.write(
    `Issues: ${counts.opened} opened, ${counts.updated} updated, ${counts.closed} closed\n`,
  );
}
