/**
 * How fast lists and advanced filters are on a big organisation: seeds a
 * throwaway database (BENCH_ROWS customers, default 100,000) with tags,
 * properties, companies and activity, then times each kind of filter through
 * the real list function, as a role under row level security (like
 * production). Prints a table (and writes it to the GitHub job summary).
 *
 *   BENCH_URL=postgres://user:pass@host/postgres BENCH_ROWS=1000000 pnpm bench:filters
 *
 * Never point it at a database you care about: it creates and drops its own.
 */
import { CursorQuery } from '@erxes/core-contract';
import { type Caller, closeDb, configureDb, runAs, runMigrations, withOrg } from '@erxes/core-db';
import { appendFileSync } from 'node:fs';
import { Client } from 'pg';
import { randomToken } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { listCompanies } from '~/modules/companies/companyList';
import { listCustomers } from '~/modules/customers/customerList';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { seedSql } from './benchSeed';
import { runCli, say } from './cli';

const baseUrl = process.env.BENCH_URL ?? process.env.DATA_TEST_URL ?? '';
const rows = Number(process.env.BENCH_ROWS ?? 100_000);
const ROLE = 'erxes_bench_runtime';
const FIRST_PAGE = CursorQuery.parse({ limit: 30 });

if (!baseUrl) throw new Error('Set BENCH_URL to a Postgres the script may create databases in');

interface Rule {
  path: string;
  op: string;
  value?: unknown;
}

const allOf = (...rules: Rule[]) => JSON.stringify({ match: 'all', rules });

const rule = (path: string, op: string, value?: unknown) => allOf({ path, op, value });

/** Each customer list query timed, by label. */
const CASES: [string, { filter?: string; search?: string }][] = [
  ['First page, no filter', {}],
  ['State is lead', { filter: rule('subject.state', 'eq', 'lead') }],
  ['Owner is a member', { filter: rule('subject.ownerId', 'eq', 'user7') }],
  [
    'Created in the last 30 days',
    { filter: rule('subject.createdAt', 'within_last', { amount: 30, unit: 'days' }) },
  ],
  ['Email contains', { filter: rule('subject.primaryEmail', 'contains', 'p12345@') }],
  ['Search box', { search: 'p12345@' }],
  ['Has a tag', { filter: rule('subject.tagIds', 'contains', 'tag5') }],
  ['Custom number > 9900', { filter: rule('subject.customFields.f_spend', 'gt', 9900) }],
  ['Custom select = gold', { filter: rule('subject.customFields.f_tier', 'eq', 'gold') }],
  [
    'Custom multi-select has golf',
    { filter: rule('subject.customFields.f_interests', 'contains', 'golf') },
  ],
  [
    'Custom date in the next 30 days',
    {
      filter: rule('subject.customFields.f_renewal', 'within_next', { amount: 30, unit: 'days' }),
    },
  ],
  [
    'No activity for 60 days',
    { filter: rule('subject.lastActivityAt', 'more_than_ago', { amount: 60, unit: 'days' }) },
  ],
  [
    'Birthday in the next 7 days',
    { filter: rule('subject.birthDate', 'anniversary_within', { amount: 7 }) },
  ],
  [
    'Company property: region is north',
    { filter: rule('subject.company.customFields.f_region', 'eq', 'north') },
  ],
  ['First name is', { filter: rule('subject.firstName', 'eq', 'Firstc4ca42') }],
  ['Search box, two words', { search: 'first c4ca 8000' }],
  ['Company industry is Retail', { filter: rule('subject.company.industry', 'eq', 'Retail') }],
  [
    'Tag and spend > 5000 and created this year',
    {
      filter: allOf(
        { path: 'subject.tagIds', op: 'contains', value: 'tag5' },
        { path: 'subject.customFields.f_spend', op: 'gt', value: 5000 },
        { path: 'subject.createdAt', op: 'within_last', value: { amount: 12, unit: 'months' } },
      ),
    },
  ],
];

const run = async (url: string, statement: string) => {
  const client = new Client({ connectionString: url });

  await client.connect();

  try {
    return await client.query(statement);
  } finally {
    await client.end();
  }
};

/** A warm-up, then the median of three, in milliseconds. */
const time = async (fn: () => Promise<unknown>) => {
  const runs: number[] = [];

  await fn();

  // One at a time: runs side by side would time each other.
  await inOrder([1, 2, 3], async () => {
    const started = performance.now();

    await fn();
    runs.push(performance.now() - started);
  });

  const [, median = 0] = runs.toSorted((a, b) => a - b);

  return median;
};

/** The organisation the bench lists, and its owner, who runs the lists. */
interface Bench {
  orgId: string;
  owner: Caller;
}

/** Migrates the new database, creates the organisation and seeds it; returns its owner. */
const prepare = async (url: string): Promise<Bench> => {
  configureDb({ url, applicationName: 'erxes-bench-migrate' });
  await runMigrations();

  const org = await createOrganization({
    subdomain: 'bench',
    name: 'Bench',
    owner: { email: 'owner@bench.mn' },
  });

  await closeDb();

  const started = performance.now();

  await run(url, seedSql(org.organization.id, rows));
  say(`seeded in ${((performance.now() - started) / 1000).toFixed(1)} s`);

  return {
    orgId: org.organization.id,
    owner: { type: 'user', userId: org.owner.id, role: 'owner', permissions: ['*'] },
  };
};

/** From here on queries run as a runtime role under row level security, like production. */
const useRuntimeRole = async (url: string) => {
  await run(
    url,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${ROLE}') THEN CREATE ROLE ${ROLE} NOLOGIN NOBYPASSRLS; END IF; END $$`,
  );
  // Already a member (or granted by whoever created the role) is fine; the next steps fail otherwise.
  await run(url, `GRANT ${ROLE} TO current_user`).catch((error: unknown) =>
    say(`could not grant ${ROLE}: ${error instanceof Error ? error.message : String(error)}`),
  );
  await run(url, `SELECT core_grant_runtime('${ROLE}')`);
  configureDb({
    url,
    role: ROLE,
    poolMax: 2,
    applicationName: 'erxes-bench',
    statementTimeoutMs: 120_000,
  });
};

type List = () => Promise<{ totalCount: number; totalCapped: boolean }>;

/** One table row: the label, the matches and the median time. */
const measure = async (label: string, list: List) => {
  let count = 0;
  let capped = false;

  const ms = await time(async () => {
    const page = await list();

    count = page.totalCount;
    capped = page.totalCapped;
  });

  return `| ${label} | ${count.toLocaleString('en')}${capped ? '+' : ''} | ${ms.toFixed(0)} |`;
};

const bench = async ({ orgId, owner }: Bench) => {
  const lines = [
    `| Filter (${rows.toLocaleString('en')} customers) | Matches | ms |`,
    '|---|---:|---:|',
  ];

  const lists: [string, List][] = [
    ...CASES.map(([label, query]): [string, List] => [
      label,
      () =>
        runAs(owner, () => withOrg(orgId, (tx) => listCustomers(tx, { ...FIRST_PAGE, ...query }))),
    ]),
    [
      'Companies, no filter',
      () => runAs(owner, () => withOrg(orgId, (tx) => listCompanies(tx, FIRST_PAGE))),
    ],
  ];

  await inOrder(lists, async ([label, list]) => {
    const line = await measure(label, list);

    lines.push(line);
    say(line);
  });

  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
};

const main = async () => {
  const name = `core_bench_${randomToken(4, 'hex')}`;
  const url = new URL(baseUrl);

  url.pathname = `/${name}`;
  await run(baseUrl, `CREATE DATABASE ${name}`);
  say(`database ${name}, ${rows.toLocaleString('en')} customers`);

  try {
    const org = await prepare(url.toString());

    await useRuntimeRole(url.toString());
    await bench(org);
  } finally {
    await closeDb();
    await run(baseUrl, `DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  }
};

runCli(main);
