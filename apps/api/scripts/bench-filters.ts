/**
 * How fast lists, filters, search, counts and detail reads are on a big
 * organisation: seeds a throwaway database (BENCH_ROWS customers, default
 * 100,000) with tags, Data Extensions fields, companies, products, timelines,
 * notifications and audit entries, then times each case of `benchCases.ts`
 * through the real service function, as a role under row level security (like
 * production). Prints a table (and writes it to the GitHub job summary).
 *
 *   BENCH_URL=postgres://user:pass@host/postgres BENCH_ROWS=1000000 pnpm bench:filters
 *
 * Never point it at a database you care about: it creates and drops its own.
 */
import { type Caller, closeDb, configureDb, runAs, runMigrations, withOrg } from '@erxes/core-db';
import { appendFileSync } from 'node:fs';
import { Client } from 'pg';
import { z } from 'zod';
import { randomToken } from '~/lib/crypto';
import { MIGRATION_STEPS } from '~/lib/migrateDb';
import { inOrder } from '~/lib/sequence';
import { createField } from '~/modules/dataExtensions/fields.service';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { type Bench, benchCases } from './benchCases';
import { BENCH_FIELDS, seedSql } from './benchSeed';
import { runCli, say } from './cli';

const baseUrl = process.env.BENCH_URL ?? process.env.DATA_TEST_URL ?? '';
const rows = Number(process.env.BENCH_ROWS ?? 100_000);
const ROLE = 'erxes_bench_runtime';

if (!baseUrl) throw new Error('Set BENCH_URL to a Postgres the script may create databases in');

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

/** Migrates the new database, creates the organisation and seeds it; returns its owner. */
const prepare = async (url: string): Promise<Bench> => {
  configureDb({ url, applicationName: 'erxes-bench-migrate' });
  await runMigrations(MIGRATION_STEPS);

  const org = await createOrganization({
    subdomain: 'bench',
    name: 'Bench',
    owner: { email: 'owner@bench.mn' },
  });

  const orgId = org.organization.id;
  const owner: Caller = { type: 'user', userId: org.owner.id, role: 'owner', permissions: ['*'] };

  // The fields' tables and columns, made as the app makes them.
  await runAs(owner, () =>
    withOrg(orgId, (tx) => inOrder(BENCH_FIELDS, (field) => createField(tx, field))),
  );
  await closeDb();

  const started = performance.now();

  await run(url, seedSql(orgId, org.owner.id, rows));
  await run(url, 'VACUUM (ANALYZE)');
  say(`seeded in ${((performance.now() - started) / 1000).toFixed(1)} s`);

  return { orgId, owner };
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

/** What a case answered: a list's count, or how many rows or hits it returned. */
const Answer = z.object({
  totalCount: z.number().optional(),
  totalCapped: z.boolean().optional(),
  data: z.array(z.unknown()).optional(),
});

const matchesOf = (answer: unknown) => {
  const { totalCount, totalCapped, data } = Answer.safeParse(answer).data ?? {};

  if (totalCount !== undefined)
    return `${totalCount.toLocaleString('en')}${totalCapped ? '+' : ''}`;

  return data ? data.length.toLocaleString('en') : '1';
};

/** One table row: the label, the matches and the median time. */
const measure = async (label: string, list: () => Promise<unknown>) => {
  let matches = '';

  const ms = await time(async () => {
    matches = matchesOf(await list());
  });

  return `| ${label} | ${matches} | ${ms.toFixed(0)} |`;
};

const bench = async (org: Bench) => {
  const lines = [
    `| Case (${rows.toLocaleString('en')} customers) | Matches | ms |`,
    '|---|---:|---:|',
  ];

  await inOrder(benchCases(org), async ([label, list]) => {
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
