import { coreContract } from '@erxes/core-contract';
import { db, rootDb, withOrg, withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';

/**
 * Tenant isolation: row level security on every organisation table, scopes
 * that fail closed, and every procedure walked as organisation A against
 * organisation B's records.
 */
describeWithDb('tenant isolation', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  const a = { orgId: '', ownerId: '', token: '' };
  const b = { orgId: '', ownerId: '', token: '' };
  const bIds: Record<string, string> = {};

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  beforeAll(async () => {
    for (const [org, subdomain] of [
      [a, 'alpha'],
      [b, 'beta'],
    ] as const) {
      const created = await createOrganization({
        subdomain,
        name: subdomain,
        owner: { email: `owner@${subdomain}.mn` },
      });

      org.orgId = created.organization.id;
      org.ownerId = created.owner.id;
      org.token = signAccessToken(created.owner.id, created.organization.id);
    }

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    // Organisation B's records, for A to reach for.
    bIds.customer = (
      await call(b.token, 'POST', '/customers', {
        firstName: 'Secret',
        primaryEmail: 'secret@beta.mn',
      })
    ).body.id;
    bIds.company = (await call(b.token, 'POST', '/companies', { primaryName: 'Beta LLC' })).body.id;
    bIds.tag = (
      await call(b.token, 'POST', '/tags', { type: 'customer', name: 'vip', colorCode: '#ff0000' })
    ).body.id;
    bIds.fieldGroup = (
      await call(b.token, 'POST', '/field-groups', { contentType: 'customer', name: 'Private' })
    ).body.id;
    bIds.field = (
      await call(b.token, 'POST', '/fields', {
        contentType: 'customer',
        label: 'Salary',
        type: 'number',
      })
    ).body.id;
    bIds.note = (
      await call(b.token, 'POST', '/activities/notes', {
        targetType: 'customer',
        targetId: bIds.customer,
        body: 'b only',
      })
    ).body.id;
    bIds.user = b.ownerId;
    bIds.file = (
      await call(b.token, 'POST', '/files', { name: 'b.txt', contentType: 'text/plain', size: 3 })
    ).body.file.id;

    for (const [key, value] of Object.entries(bIds)) {
      if (!value) throw new Error(`fixture ${key} was not created`);
    }
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('has row level security, forced, on every table that belongs to an organisation', async () => {
    const result = await adminDb().execute<{
      table_name: string;
      rls: boolean;
      forced: boolean;
      policies: number;
    }>(sql`
      select c.relname as table_name, c.relrowsecurity as rls, c.relforcerowsecurity as forced,
             (select count(*)::int from pg_policies p where p.tablename = c.relname) as policies
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
      where c.relkind = 'r' and c.relname like 'core\\_%'
        and (exists (select 1 from information_schema.columns col where col.table_name = c.relname and col.column_name = 'org_id')
             or c.relname = 'core_organizations')
    `);

    expect(result.rows.length).toBeGreaterThan(15);

    for (const row of result.rows) {
      expect({
        table: row.table_name,
        rls: row.rls,
        forced: row.forced,
        policy: row.policies > 0,
      }).toEqual({
        table: row.table_name,
        rls: true,
        forced: true,
        policy: true,
      });
    }
  });

  it('runs as a role that does not bypass row level security', async () => {
    const { runtimeRole } = await import('@erxes/core-db');

    expect((await runtimeRole()).bypassesRls).toBe(false);
  });

  it('fails closed outside a scope, and keeps each scope to its organisation', async () => {
    // No scope: nothing is visible, nothing can be written.
    expect((await rootDb().execute(sql`select id from core_customers`)).rows).toEqual([]);
    await expect(
      rootDb().execute(
        sql`insert into core_tags (id, org_id, type, name) values ('x1', ${a.orgId}, 'customer', 'x')`,
      ),
    ).rejects.toThrow();

    // In A's scope: only A's rows; B's rows can't be read, changed or created.
    await withOrg(a.orgId, async (tx) => {
      expect(
        (await tx.execute(sql`select id from core_customers where id = ${bIds.customer}`)).rows,
      ).toEqual([]);

      const updated = await tx.execute(
        sql`update core_customers set first_name = 'pwned' where id = ${bIds.customer}`,
      );

      expect(updated.rowCount).toBe(0);
    });
    await expect(
      withOrg(a.orgId, (tx) =>
        tx.execute(
          sql`insert into core_tags (id, org_id, type, name) values ('x2', ${b.orgId}, 'customer', 'x')`,
        ),
      ),
    ).rejects.toThrow();

    // Asking for another organisation inside a scope is a bug.
    await expect(withOrg(a.orgId, () => withOrg(b.orgId, async () => 1))).rejects.toThrow(
      /tenant scope mismatch/,
    );

    // Nested scopes share the transaction, and `db()` inside is that transaction.
    await withOrg(a.orgId, async (outer) => {
      await withOrg(a.orgId, async (inner) => expect(inner).toBe(outer));
      expect(db()).toBe(outer);
    });

    // A pooled connection carries nothing over after commit or rollback.
    await withOrg(a.orgId, async () => undefined);
    await withOrg(a.orgId, async () => Promise.reject(new Error('rolled back'))).catch(
      () => undefined,
    );

    for (let index = 0; index < 8; index += 1) {
      const leftover = await rootDb().execute<{ org: string | null; system: string | null }>(
        sql`select nullif(current_setting('app.org_id', true), '') as org, nullif(current_setting('app.system', true), '') as system`,
      );

      expect(leftover.rows[0]).toEqual({ org: null, system: null });
    }

    // The system scope sees across organisations (jobs only).
    const all = await withSystem('test', (tx) =>
      tx.execute(sql`select count(distinct org_id)::int as n from core_customers`),
    );

    expect(all.rows[0]).toEqual({ n: 1 });
  });

  it("walks every procedure with an id as organisation A against B's records: none succeeds", async () => {
    const idFor: Record<string, string> = {
      customers: bIds.customer!,
      companies: bIds.company!,
      tags: bIds.tag!,
      fields: bIds.field!,
      fieldGroups: bIds.fieldGroup!,
      users: bIds.user!,
      files: bIds.file!,
      activities: bIds.note!,
      notifications: bIds.note!,
    };

    const bodies: Record<string, unknown> = {
      'customers.update': { firstName: 'pwned' },
      'companies.update': { primaryName: 'pwned' },
      'tags.update': { name: 'pwned' },
      'fields.update': { label: 'pwned' },
      'fieldGroups.update': { name: 'pwned' },
      'users.update': { fullName: 'pwned' },
      'users.setPassword': { password: 'Pwned-password-1' },
      'activities.updateNote': { body: 'pwned' },
    };

    let walked = 0;

    for (const [group, procedures] of Object.entries(coreContract)) {
      for (const [name, procedure] of Object.entries(
        procedures as Record<string, { '~orpc': { route: { method?: string; path?: string } } }>,
      )) {
        const { method = 'GET', path = '' } = procedure['~orpc'].route;

        if (!path.includes('{id}') || !idFor[group]) continue;

        const url = path
          .replace('/core/v1', '')
          .replace('{id}', idFor[group])
          .replace('{companyId}', bIds.company!);

        const response = await call(
          a.token,
          method,
          url,
          method === 'GET' || method === 'DELETE' ? undefined : (bodies[`${group}.${name}`] ?? {}),
        );

        walked += 1;
        expect({ procedure: `${group}.${name}`, ok: response.status < 300 }).toEqual({
          procedure: `${group}.${name}`,
          ok: false,
        });
      }
    }

    expect(walked).toBeGreaterThan(20);

    // And B's data is as it was.
    const customer = await call(b.token, 'GET', `/customers/${bIds.customer}`);

    expect(customer.body.firstName).toBe('Secret');
    expect(
      (await call(b.token, 'GET', `/tags?type=customer`)).body.data.map(
        (tag: { name: string }) => tag.name,
      ),
    ).toEqual(['vip']);
  });

  it("can't link records across organisations, even bypassing row level security", async () => {
    const aCustomer = (await call(a.token, 'POST', '/customers', { firstName: 'Mine' })).body
      .id as string;

    const attempts = [
      sql`insert into core_customer_tags (org_id, customer_id, tag_id) values (${a.orgId}, ${aCustomer}, ${bIds.tag})`,
      sql`insert into core_customer_companies (org_id, customer_id, company_id) values (${a.orgId}, ${aCustomer}, ${bIds.company})`,
      sql`update core_customers set owner_id = ${b.ownerId} where id = ${aCustomer}`,
    ];

    for (const attempt of attempts) {
      await expect(adminDb().execute(attempt)).rejects.toThrow();
    }
  });

  it("lists only the caller's organisation", async () => {
    for (const path of [
      '/customers',
      '/companies',
      '/tags?type=customer',
      '/fields?contentType=customer',
      '/users',
      '/audit',
      '/events',
    ]) {
      const listed = await call(a.token, 'GET', path);

      expect({ path, status: listed.status }).toEqual({ path, status: 200 });
      expect(JSON.stringify(listed.body)).not.toContain(b.orgId);

      for (const id of Object.values(bIds)) expect(JSON.stringify(listed.body)).not.toContain(id);
    }
  });
});
