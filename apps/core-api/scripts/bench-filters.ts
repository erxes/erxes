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
import { closeDb, configureDb, runMigrations, withOrg } from '@erxes/core-db';
import { appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import type { Actor } from '~/http/auth';
import { listCompanies } from '~/modules/companies/companies.service';
import { listCustomers } from '~/modules/customers/customers.service';
import { createOrganization } from '~/modules/organizations/organizations.service';

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

const time = async (fn: () => Promise<unknown>) => {
  const runs: number[] = [];

  // A warm-up, then the median of three.
  await fn();
  for (let i = 0; i < 3; i += 1) {
    const started = performance.now();

    await fn();
    runs.push(performance.now() - started);
  }

  return runs.sort((a, b) => a - b)[1]!;
};

const main = async () => {
  const name = `core_bench_${randomBytes(4).toString('hex')}`;
  const url = new URL(baseUrl);

  url.pathname = `/${name}`;
  await run(baseUrl, `CREATE DATABASE ${name}`);
  console.log(`database ${name}, ${rows.toLocaleString('en')} customers`);

  try {
    configureDb({ url: url.toString(), applicationName: 'erxes-bench-migrate' });
    await runMigrations();

    const org = await createOrganization({ subdomain: 'bench', name: 'Bench', owner: { email: 'owner@bench.mn' } });
    const orgId = org.organization.id;
    const ownerId = org.owner.id;

    await closeDb();

    const db = url.toString();
    const started = performance.now();

    // Seeding as the owner (no row level security), in plain SQL.
    await run(
      db,
      `
      INSERT INTO core_fields (id, org_id, content_type, label, type, options, "order")
      VALUES ('f_spend', '${orgId}', 'customer', 'Spend', 'number', '{}', 1),
             ('f_tier', '${orgId}', 'customer', 'Tier', 'select', '{bronze,silver,gold}', 2),
             ('f_interests', '${orgId}', 'customer', 'Interests', 'multiselect', '{golf,ski,music,food}', 3),
             ('f_renewal', '${orgId}', 'customer', 'Renewal', 'date', '{}', 4);
      INSERT INTO core_tags (id, org_id, type, name)
        SELECT 'tag' || g, '${orgId}', 'customer', 'Tag ' || g FROM generate_series(1, 20) g;
      INSERT INTO core_users (id, org_id, email, role, status)
        SELECT 'user' || g, '${orgId}', 'user' || g || '@bench.mn', 'member', 'active' FROM generate_series(1, 20) g;
      INSERT INTO core_customers (id, org_id, state, first_name, last_name, primary_email, emails, primary_phone, phones, birth_date, owner_id, custom_fields, created_at, updated_at)
        SELECT 'c' || g, '${orgId}',
          CASE WHEN g % 5 = 0 THEN 'lead' ELSE 'customer' END,
          'First' || substr(md5(g::text), 1, 6), 'Last' || substr(md5((g * 7)::text), 1, 6),
          'p' || g || '@' || substr(md5(g::text), 1, 5) || '.mn', ARRAY['p' || g || '@' || substr(md5(g::text), 1, 5) || '.mn'],
          (80000000 + g)::text, ARRAY[(80000000 + g)::text],
          date '1960-01-01' + (g % 16000),
          CASE WHEN g % 3 = 0 THEN 'user' || (g % 20 + 1) END,
          jsonb_build_object(
            'f_spend', (g * 37) % 10000,
            'f_tier', (ARRAY['bronze','silver','gold'])[g % 3 + 1],
            'f_interests', CASE WHEN g % 4 = 0 THEN '["golf","music"]'::jsonb ELSE '["food"]'::jsonb END,
            'f_renewal', to_char(current_date + (g % 400) - 200, 'YYYY-MM-DD')),
          now() - make_interval(mins => g % (3 * 365 * 24 * 60)),
          now() - make_interval(mins => g % (365 * 24 * 60))
        FROM generate_series(1, ${rows}) g;
      INSERT INTO core_customer_tags (org_id, customer_id, tag_id)
        SELECT '${orgId}', 'c' || g, 'tag' || (g % 20 + 1) FROM generate_series(1, ${rows}) g WHERE g % 3 = 0;
      INSERT INTO core_companies (id, org_id, primary_name, names, emails, phones, industry, created_at, updated_at)
        SELECT 'co' || g, '${orgId}', 'Company ' || g, ARRAY['Company ' || g], '{}', '{}',
          (ARRAY['Retail','Mining','Finance','Tech'])[g % 4 + 1], now(), now()
        FROM generate_series(1, ${Math.max(1, Math.floor(rows / 20))}) g;
      INSERT INTO core_customer_companies (org_id, customer_id, company_id)
        SELECT '${orgId}', 'c' || g, 'co' || ((g / 2) % ${Math.max(1, Math.floor(rows / 20))} + 1) FROM generate_series(1, ${rows}) g WHERE g % 2 = 0;
      INSERT INTO core_activities (id, org_id, target_type, target_id, source, type, actor_type, created_at)
        SELECT 'a' || g, '${orgId}', 'customer', 'c' || (g * 13 % ${rows} + 1), 'core', 'customer.note', 'system',
          now() - make_interval(hours => g % (2 * 365 * 24))
        FROM generate_series(1, ${rows}) g;
      ANALYZE;
      `,
    );
    console.log(`seeded in ${((performance.now() - started) / 1000).toFixed(1)} s`);

    await run(db, `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${ROLE}') THEN CREATE ROLE ${ROLE} NOLOGIN NOBYPASSRLS; END IF; END $$`);
    await run(db, `GRANT ${ROLE} TO current_user`).catch(() => undefined);
    await run(db, `SELECT core_grant_runtime('${ROLE}')`);
    configureDb({ url: db, role: ROLE, poolMax: 2, applicationName: 'erxes-bench', statementTimeoutMs: 120_000 });

    const actor: Actor = { userId: ownerId, orgId, role: 'owner', permissions: ['*'] };
    const rule = (path: string, op: string, value?: unknown) => JSON.stringify({ match: 'all', rules: [{ path, op, ...(value === undefined ? {} : { value }) }] });
    const cases: [string, () => Promise<{ totalCount: number }>][] = [
      ['First page, no filter', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30 } as never))],
      ['State is lead', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.state', 'eq', 'lead') } as never))],
      ['Owner is a member', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.ownerId', 'eq', 'user7') } as never))],
      ['Created in the last 30 days', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.createdAt', 'within_last', { amount: 30, unit: 'days' }) } as never))],
      ['Email contains', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.primaryEmail', 'contains', 'p12345@') } as never))],
      ['Search box', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, search: 'p12345@' } as never))],
      ['Has a tag', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.tagIds', 'contains', 'tag5') } as never))],
      ['Custom number > 9900', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.customFields.f_spend', 'gt', 9900) } as never))],
      ['Custom select = gold', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.customFields.f_tier', 'eq', 'gold') } as never))],
      ['Custom multi-select has golf', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.customFields.f_interests', 'contains', 'golf') } as never))],
      ['Custom date in the next 30 days', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.customFields.f_renewal', 'within_next', { amount: 30, unit: 'days' }) } as never))],
      ['No activity for 60 days', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.lastActivityAt', 'more_than_ago', { amount: 60, unit: 'days' }) } as never))],
      ['Birthday in the next 7 days', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.birthDate', 'anniversary_within', { amount: 7 }) } as never))],
      ['Company industry is Retail', () => withOrg(orgId, (tx) => listCustomers(tx, actor, { limit: 30, filter: rule('subject.company.industry', 'eq', 'Retail') } as never))],
      [
        'Tag and spend > 5000 and created this year',
        () =>
          withOrg(orgId, (tx) =>
            listCustomers(tx, actor, {
              limit: 30,
              filter: JSON.stringify({
                match: 'all',
                rules: [
                  { path: 'subject.tagIds', op: 'contains', value: 'tag5' },
                  { path: 'subject.customFields.f_spend', op: 'gt', value: 5000 },
                  { path: 'subject.createdAt', op: 'within_last', value: { amount: 12, unit: 'months' } },
                ],
              }),
            } as never),
          ),
      ],
      ['Companies, no filter', () => withOrg(orgId, (tx) => listCompanies(tx, actor, { limit: 30 } as never))],
    ];
    const lines = [`| Filter (${rows.toLocaleString('en')} customers) | Matches | ms |`, '|---|---:|---:|'];

    for (const [label, fn] of cases) {
      let count = 0;
      const ms = await time(async () => {
        count = (await fn()).totalCount;
      });

      lines.push(`| ${label} | ${count.toLocaleString('en')}${count === 10_000 ? '+' : ''} | ${ms.toFixed(0)} |`);
      console.log(lines.at(-1));
    }

    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
  } finally {
    await closeDb();
    await run(baseUrl, `DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
