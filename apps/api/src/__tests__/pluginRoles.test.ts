import { pluginInstallations, plugins } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { Client } from 'pg';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { adminDb, testDatabaseUrl, useTestDatabase } from './db';

/** Runs `fn` on a connection acting as the testhr plugin's database role. */
const asPlugin = async <T>(fn: (client: Client) => Promise<T>) => {
  const url = new URL(testDatabaseUrl());

  if (url.port === '6543') url.port = '5432';

  const client = new Client({ connectionString: url.toString() });

  await client.connect();

  try {
    await client.query('SET ROLE erxes_plugin_testhr');

    return await fn(client);
  } finally {
    await client.end();
  }
};

/** The error message a statement fails with, or null. */
const fails = (client: Client, statement: string, params: string[] = []) =>
  client.query(statement, params).then(
    () => null,
    (error: Error) => error.message,
  );

/** What core_plugin_tenancy_problems lists for the testhr plugin's tables. */
const problems = async () =>
  (
    await adminDb().execute<{ problem: string }>(
      sql`select core_plugin_tenancy_problems('testhr') as problem`,
    )
  ).rows.map((row) => row.problem);

/** The id a core function returned. */
const idFrom = async (client: Client, statement: string, params: string[]) =>
  (await client.query<{ id: string | null }>(statement, params)).rows[0]?.id;

/** The schema core_plugin_org_schema made for the plugin and organisation. */
const schemaFor = (client: Client, org: string) =>
  idFrom(client, 'select core_plugin_org_schema($1) as id', [org]);

/** Whether the testpw plugin's role may sign in, and its stored password hash. */
const login = async () =>
  (
    await adminDb().execute<{ canLogin: boolean; password: string | null }>(
      sql`select rolcanlogin as "canLogin", rolpassword as password from pg_authid where rolname = 'erxes_plugin_testpw'`,
    )
  ).rows[0];

/** A plugin's database role can't read, change or drop core data, and can't act as another plugin. */
describe('plugin database roles', { timeout: 240_000 }, () => {
  useTestDatabase();

  let orgA = '';
  let orgB = '';

  beforeAll(async () => {
    const alpha = await createOrganization({
      subdomain: 'alpha',
      name: 'Alpha',
      owner: { email: 'a@alpha.mn' },
    });

    const beta = await createOrganization({
      subdomain: 'beta',
      name: 'Beta',
      owner: { email: 'b@beta.mn' },
    });

    orgA = alpha.organization.id;
    orgB = beta.organization.id;
    await adminDb().insert(plugins).values({ name: 'testhr' }).onConflictDoNothing();
    await adminDb()
      .insert(pluginInstallations)
      .values({ orgId: orgA, plugin: 'testhr', grantedScopes: [] })
      .onConflictDoNothing();
    await adminDb().execute(sql.raw(pluginRoleSql('testhr')));
    await adminDb().execute(sql.raw('GRANT erxes_plugin_testhr TO current_user'));
    await adminDb().execute(
      sql`insert into core_customers (id, org_id, first_name) values ('c-1', ${orgA}, 'Keep me')`,
    );
  });

  it('has no rights on core tables: no reading, deleting, dropping or truncating', async () => {
    await asPlugin(async (client) => {
      expect(await fails(client, 'select * from core_customers')).toMatch(/permission denied/);
      expect(await fails(client, 'delete from core_customers')).toMatch(/permission denied/);
      expect(await fails(client, 'truncate core_audit_logs')).toMatch(
        /permission denied|append-only/,
      );
      expect(await fails(client, 'drop table core_customers')).toMatch(/must be owner/);
      expect(
        await fails(client, 'update core_plugin_installations set status = $1', ['active']),
      ).toMatch(/permission denied/);
      expect(await fails(client, 'alter table core_users disable row level security')).toMatch(
        /must be owner/,
      );
    });

    const [kept] = (
      await adminDb().execute<{ first_name: string }>(
        sql`select first_name from core_customers where id = 'c-1'`,
      )
    ).rows;

    expect(kept?.first_name).toBe('Keep me');
  });

  it('reaches core only through its functions, as itself', async () => {
    await asPlugin(async (client) => {
      expect(
        await idFrom(client, 'select core_publish_event($1, $2, $3) as id', [
          orgA,
          'testhr',
          'testhr.leave.approved',
        ]),
      ).toEqual(expect.any(String));
      expect(
        await fails(client, 'select core_publish_event($1, $2, $3)', [
          orgA,
          'hr',
          'hr.leave.approved',
        ]),
      ).toMatch(/plugin testhr, not hr/);
      // Not installed in organisation B.
      expect(
        await fails(client, 'select core_publish_event($1, $2, $3)', [
          orgB,
          'testhr',
          'testhr.leave.approved',
        ]),
      ).toMatch(/not installed/);
      expect(
        await idFrom(client, 'select core_record_audit($1, $2, $3) as id', [
          orgA,
          'testhr',
          'testhr.employee.deleted',
        ]),
      ).toEqual(expect.any(String));
    });
  });

  it('keeps its own tables per organisation with core_enable_tenant_rls', async () => {
    await asPlugin(async (client) => {
      await client.query(
        'create table testhr_items (id text primary key, org_id text not null, name text)',
      );
      await client.query(`select core_enable_tenant_rls('testhr_items')`);
      await client.query('begin');
      await client.query(`select set_config('app.org_id', $1, true)`, [orgA]);
      await client.query(`insert into testhr_items values ('i1', $1, 'mine')`, [orgA]);
      expect(
        await fails(client, `insert into testhr_items values ('i2', $1, 'theirs')`, [orgB]),
      ).toMatch(/row-level security/);
      await client.query('rollback');
      await client.query('begin');
      await client.query(`select set_config('app.org_id', $1, true)`, [orgA]);
      await client.query(`insert into testhr_items values ('i1', $1, 'mine')`, [orgA]);
      await client.query('commit');

      // Another organisation's transaction sees nothing of A's.
      await client.query('begin');
      await client.query(`select set_config('app.org_id', $1, true)`, [orgB]);
      expect((await client.query('select * from testhr_items')).rows).toEqual([]);
      expect((await client.query('delete from testhr_items')).rowCount).toBe(0);
      await client.query('commit');
      // Without an organisation: nothing at all.
      expect((await client.query('select * from testhr_items')).rows).toEqual([]);
    });
  });

  it('can refuse overlapping rows with a btree_gist exclusion constraint', async () => {
    await asPlugin(async (client) => {
      // A reservation per room may not overlap another in the same organisation.
      await client.query(
        `create table testhr_bookings (
          id text primary key, org_id text not null, room_id text not null, during tstzrange not null,
          constraint testhr_bookings_no_overlap exclude using gist (org_id with =, room_id with =, during with &&)
        )`,
      );
      await client.query(`select core_enable_tenant_rls('testhr_bookings')`);
      await client.query('begin');
      await client.query(`select set_config('app.org_id', $1, true)`, [orgA]);

      const book = (id: string, from: string, to: string) =>
        fails(client, `insert into testhr_bookings values ($1, $2, 'r1', tstzrange($3, $4))`, [
          id,
          orgA,
          from,
          to,
        ]);

      expect(await book('b1', '2026-12-01 14:00Z', '2026-12-03 12:00Z')).toBeNull();
      expect(await book('b2', '2026-12-02 14:00Z', '2026-12-04 12:00Z')).toMatch(
        /testhr_bookings_no_overlap/,
      );
      await client.query('rollback');
    });
  });

  it('lists its tables that are open to every organisation or misnamed', async () => {
    await asPlugin(async (client) => {
      await client.query('create table testhr_open (id text primary key, org_id text not null)');
      await client.query('create table payroll (id text primary key, org_id text not null)');
      await client.query(`select core_enable_tenant_rls('payroll')`);
      // Its own migration bookkeeping passes; another plugin's name doesn't.
      await client.query('create table __drizzle_migrations_testhr (id serial primary key)');
      await client.query('create table __drizzle_migrations_hr (id serial primary key)');
    });

    expect(await problems()).toEqual([
      "__drizzle_migrations_hr: owned by plugin testhr, so its name must start with testhr_, row level security is off, row level security is not forced, no tenant policy: run SELECT core_enable_tenant_rls('__drizzle_migrations_hr')",
      'payroll: owned by plugin testhr, so its name must start with testhr_',
      "testhr_open: row level security is off, row level security is not forced, no tenant policy: run SELECT core_enable_tenant_rls('testhr_open')",
    ]);

    await asPlugin(async (client) => {
      await client.query(`select core_enable_tenant_rls('testhr_open')`);
      await client.query('create policy everyone on testhr_open using (true)');
    });

    expect(await problems()).toEqual([
      "__drizzle_migrations_hr: owned by plugin testhr, so its name must start with testhr_, row level security is off, row level security is not forced, no tenant policy: run SELECT core_enable_tenant_rls('__drizzle_migrations_hr')",
      'payroll: owned by plugin testhr, so its name must start with testhr_',
      'testhr_open: permissive policy everyone is not the tenant check, so it lets more rows through',
    ]);

    await asPlugin(async (client) => {
      await client.query('drop policy everyone on testhr_open');
      await client.query('alter table payroll rename to testhr_payroll');
      await client.query('drop table __drizzle_migrations_hr');
    });

    expect(await problems()).toEqual([]);
  });

  it('gets a schema per organisation only with records:extend, and keeps its tables there tenant-checked', async () => {
    await asPlugin(async (client) => {
      expect(await fails(client, 'create schema testhr_mine')).toMatch(/permission denied/);
      expect(await fails(client, 'select core_plugin_org_schema($1)', [orgA])).toMatch(
        /not installed with records:extend/,
      );
    });

    await adminDb().execute(
      sql`update core_plugin_installations set granted_scopes = array['records:extend'] where plugin = 'testhr'`,
    );

    const schema = `testhr_${orgA}`;
    // Quoted as Postgres shows it: org ids are mixed case.
    const table = `${/^[a-z0-9_]+$/.test(schema) ? schema : `"${schema}"`}.contacts`;

    await asPlugin(async (client) => {
      expect(await schemaFor(client, orgA)).toBe(schema);
      // Again: the same schema.
      expect(await schemaFor(client, orgA)).toBe(schema);
      expect(await fails(client, 'select core_plugin_org_schema($1)', [orgB])).toMatch(
        /not installed with records:extend/,
      );
      expect(await fails(client, 'select core_plugin_org_schema($1)', ['x; drop'])).toMatch(
        /invalid organisation id/,
      );
      await client.query(`create table ${table} (id text primary key, org_id text not null)`);
    });

    expect(await problems()).toEqual([
      `${table}: row level security is off, row level security is not forced, no tenant policy: run SELECT core_enable_tenant_rls('${table}')`,
    ]);

    await asPlugin((client) => client.query(`select core_enable_tenant_rls('${table}')`));
    expect(await problems()).toEqual([]);

    // A materialized view has no row level security: whatever it cached, every organisation sees.
    const cache = table.replace(/contacts$/, 'cache');

    await asPlugin((client) =>
      client.query(`create materialized view ${cache} as select * from ${table}`),
    );
    expect(await problems()).toEqual([
      `${cache}: a materialized view shows every organisation the rows it cached: use a table with row level security`,
    ]);
    await asPlugin((client) => client.query(`drop materialized view ${cache}`));

    // A plugin's function named like a built-in never runs as core.
    await asPlugin(async (client) => {
      await client.query(`create function public.format(text, text) returns text language plpgsql
        as $$ begin raise exception 'core ran the plugin''s format'; end $$`);
      expect(await schemaFor(client, orgA)).toBe(schema);
    });
    expect(await problems()).toEqual([]);
    await asPlugin((client) => client.query('drop function public.format(text, text)'));

    // A version that no longer asks for the scope gets no schema, though it was granted.
    await adminDb().execute(
      sql`update core_plugins set manifest = '{"scopes": []}' where name = 'testhr'`,
    );
    await asPlugin(async (client) => {
      expect(await fails(client, 'select core_plugin_org_schema($1)', [orgA])).toMatch(
        /not installed with records:extend/,
      );
    });

    // Core's own roles can't call it as a plugin.
    const refusal = await adminDb()
      .execute(sql`select core_plugin_org_schema(${orgA})`)
      .then(
        () => '',
        (error: unknown) =>
          error instanceof Error && error.cause instanceof Error ? error.cause.message : '',
      );

    expect(refusal).toMatch(/only a plugin/);
  });

  it('grants again without a password and leaves the login and its password as they were', async () => {
    await adminDb().execute(sql.raw(pluginRoleSql('testpw', 'first-password-of-32-characters')));
    const before = await login();

    await adminDb().execute(sql.raw(pluginRoleSql('testpw')));

    expect(before?.canLogin).toBe(true);
    expect(before?.password).toMatch(/^SCRAM-SHA-256\$/);
    expect(await login()).toEqual(before);
  });
});
