import { db, rootDb, runtimeRole, withOrg, withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, dbError, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const tag = (id: string, org: string) =>
  sql`insert into core_tags (id, org_id, type, name) values (${id}, ${org}, 'customer', 'x')`;

/**
 * Tenant isolation in the database: scopes that fail closed and keep to their
 * organisation. `pnpm check:rls` checks every table has row level security;
 * `tenantWalk.test.ts` walks the API.
 */
describe('tenant isolation (database)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const theirs = { customer: '', company: '', tag: '' };

  beforeAll(async () => {
    theirs.customer = (
      await t.other().customers.create({ firstName: 'Secret', primaryEmail: 'secret@globex.mn' })
    ).id;
    theirs.company = (await t.other().companies.create({ primaryName: 'Globex LLC' })).id;
    theirs.tag = (await t.other().tags.create({ type: 'customer', name: 'vip' })).id;
  });

  it('runs as a role that does not bypass row level security', async () => {
    expect((await runtimeRole()).bypassesRls).toBe(false);
  });

  it('fails closed outside a scope, and keeps each scope to its organisation', async () => {
    // No scope: nothing is visible, nothing can be written.
    expect((await rootDb().execute(sql`select id from core_customers`)).rows).toEqual([]);
    expect(await dbError(rootDb().execute(tag('x1', t.ids.org)))).toMatch(/row-level security/);

    // In A's scope: only A's rows; B's rows can't be read, changed or created.
    await withOrg(t.ids.org, async (tx) => {
      expect(
        (await tx.execute(sql`select id from core_customers where id = ${theirs.customer}`)).rows,
      ).toEqual([]);
      expect(
        (
          await tx.execute(
            sql`update core_customers set first_name = 'pwned' where id = ${theirs.customer}`,
          )
        ).rowCount,
      ).toBe(0);
    });
    expect(
      await dbError(withOrg(t.ids.org, (tx) => tx.execute(tag('x2', t.ids.otherOrg)))),
    ).toMatch(/row-level security/);

    // Asking for another organisation inside a scope is a bug.
    await expect(withOrg(t.ids.org, () => withOrg(t.ids.otherOrg, async () => 1))).rejects.toThrow(
      /tenant scope mismatch/,
    );

    // Nested scopes share the transaction, and `db()` inside is that transaction.
    await withOrg(t.ids.org, async (outer) => {
      await withOrg(t.ids.org, async (inner) => expect(inner).toBe(outer));
      expect(db()).toBe(outer);
    });

    // A pooled connection carries nothing over after commit or rollback.
    await withOrg(t.ids.org, async () => undefined);
    await expect(
      withOrg(t.ids.org, () => Promise.reject(new Error('rolled back'))),
    ).rejects.toThrow('rolled back');

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

  it("can't link records across organisations, even bypassing row level security", async () => {
    const { id: mine } = await t.owner().customers.create({ firstName: 'Mine' });

    const attempts = [
      sql`insert into core_customer_tags (org_id, customer_id, tag_id) values (${t.ids.org}, ${mine}, ${theirs.tag})`,
      sql`insert into core_customer_companies (org_id, customer_id, company_id) values (${t.ids.org}, ${mine}, ${theirs.company})`,
      sql`update core_customers set owner_id = ${t.ids.otherOwner} where id = ${mine}`,
    ];

    for (const attempt of attempts)
      expect(await dbError(adminDb().execute(attempt))).toMatch(/foreign key/);
  });
});
