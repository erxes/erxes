import { Client } from 'pg';
import { beforeAll, expect, it } from 'vitest';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { pluginRoleSql } from '../../scripts/plugin-role';
import { adminDb, describeWithDb, testDatabaseUrl, useTestDatabase } from './db';

/** A plugin's database role can't read, change or drop core data, and can't act as another plugin. */
describeWithDb('plugin database roles', { timeout: 240_000 }, () => {
  useTestDatabase();

  let orgA = '';
  let orgB = '';

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

  const fails = (client: Client, statement: string, params: unknown[] = []) =>
    client.query(statement, params).then(
      () => null,
      (error: Error) => error.message,
    );

  beforeAll(async () => {
    const { sql } = await import('drizzle-orm');
    const { plugins, pluginInstallations } = await import('@erxes/core-db');

    orgA = (await createOrganization({ subdomain: 'alpha', name: 'Alpha', owner: { email: 'a@alpha.mn' } })).organization.id;
    orgB = (await createOrganization({ subdomain: 'beta', name: 'Beta', owner: { email: 'b@beta.mn' } })).organization.id;
    await adminDb().insert(plugins).values({ name: 'testhr' }).onConflictDoNothing();
    await adminDb().insert(pluginInstallations).values({ orgId: orgA, plugin: 'testhr', grantedScopes: [] }).onConflictDoNothing();
    await adminDb().execute(sql.raw(pluginRoleSql('testhr')));
    await adminDb().execute(sql.raw('GRANT erxes_plugin_testhr TO current_user'));
    await adminDb().execute(sql`insert into core_customers (id, org_id, first_name) values ('c-1', ${orgA}, 'Keep me')`);
  });

  it('has no rights on core tables: no reading, deleting, dropping or truncating', async () => {
    await asPlugin(async (client) => {
      expect(await fails(client, 'select * from core_customers')).toMatch(/permission denied/);
      expect(await fails(client, 'delete from core_customers')).toMatch(/permission denied/);
      expect(await fails(client, 'truncate core_audit_logs')).toMatch(/permission denied|append-only/);
      expect(await fails(client, 'drop table core_customers')).toMatch(/must be owner/);
      expect(await fails(client, 'update core_plugin_installations set status = $1', ['active'])).toMatch(/permission denied/);
      expect(await fails(client, 'alter table core_users disable row level security')).toMatch(/must be owner/);
    });

    const [kept] = (await adminDb().execute<{ first_name: string }>((await import('drizzle-orm')).sql`select first_name from core_customers where id = 'c-1'`)).rows;

    expect(kept?.first_name).toBe('Keep me');
  });

  it('reaches core only through its functions, as itself', async () => {
    await asPlugin(async (client) => {
      const published = await client.query('select core_publish_event($1, $2, $3) as id', [orgA, 'testhr', 'testhr.leave.approved']);

      expect(published.rows[0].id).toBeTruthy();
      expect(await fails(client, 'select core_publish_event($1, $2, $3)', [orgA, 'hr', 'hr.leave.approved'])).toMatch(/plugin testhr, not hr/);
      // Not installed in organisation B.
      expect(await fails(client, 'select core_publish_event($1, $2, $3)', [orgB, 'testhr', 'testhr.leave.approved'])).toMatch(/not installed/);
      expect((await client.query('select core_record_audit($1, $2, $3) as id', [orgA, 'testhr', 'testhr.employee.deleted'])).rows[0].id).toBeTruthy();
    });
  });

  it('keeps its own tables per organisation with core_enable_tenant_rls', async () => {
    await asPlugin(async (client) => {
      await client.query('create table testhr_items (id text primary key, org_id text not null, name text)');
      await client.query(`select core_enable_tenant_rls('testhr_items')`);
      await client.query('begin');
      await client.query(`select set_config('app.org_id', $1, true)`, [orgA]);
      await client.query(`insert into testhr_items values ('i1', $1, 'mine')`, [orgA]);
      expect(await fails(client, `insert into testhr_items values ('i2', $1, 'theirs')`, [orgB])).toMatch(/row-level security/);
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
});
