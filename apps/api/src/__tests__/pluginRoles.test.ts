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

  it('lists its tables that are open to every organisation or misnamed', async () => {
    await asPlugin(async (client) => {
      await client.query('create table testhr_open (id text primary key, org_id text not null)');
      await client.query('create table payroll (id text primary key, org_id text not null)');
      await client.query(`select core_enable_tenant_rls('payroll')`);
    });

    expect(await problems()).toEqual([
      'payroll: owned by plugin testhr, so its name must start with testhr_',
      "testhr_open: row level security is off, row level security is not forced, no tenant policy: run SELECT core_enable_tenant_rls('testhr_open')",
    ]);

    await asPlugin(async (client) => {
      await client.query(`select core_enable_tenant_rls('testhr_open')`);
      await client.query('create policy everyone on testhr_open using (true)');
    });

    expect(await problems()).toEqual([
      'payroll: owned by plugin testhr, so its name must start with testhr_',
      'testhr_open: permissive policy everyone is not the tenant check, so it lets more rows through',
    ]);

    await asPlugin(async (client) => {
      await client.query('drop policy everyone on testhr_open');
      await client.query('alter table payroll rename to testhr_payroll');
    });

    expect(await problems()).toEqual([]);
  });
});
