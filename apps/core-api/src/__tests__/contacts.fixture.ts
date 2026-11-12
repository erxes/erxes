import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';
import { customers, newId, roles, users } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { beforeAll } from 'vite-plus/test';
import { adminDb } from './db';
import { type CoreClient, useTwoOrgs } from './support';

/** A one-rule filter. */
export const rule = (path: string, op: ConditionRule['op'], value?: unknown): ConditionGroup => ({
  match: 'all',
  rules: [{ path, op, ...(value === undefined ? {} : { value }) }],
});

/** `MM-DD` some days from now, for birthdays and renewals. */
const monthDayIn = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(5, 10);

const sorted = (names: (string | null)[]) =>
  names.map((name) => name ?? '').toSorted((a, b) => a.localeCompare(b));

/**
 * Acme's contacts for filter and view tests: Bat (a VIP lead at golf.mn who
 * spends 1500, likes golf, birthday in 5 days), Dorj (Member's customer for
 * 40 days, spends 200), Saraa (at Retail Co, an industry Retail company of 40)
 * and Lonely LLC (Mining). Custom fields Spend and Interests; a Viewer role
 * that may only view contacts.
 */
export const useContacts = () => {
  const t = useTwoOrgs();
  const ids = { bat: '', dorj: '', saraa: '', retail: '', viewer: '' };
  const fields = { spend: '', interests: '' };
  let vip = '';

  beforeAll(async () => {
    ids.viewer = newId();
    await adminDb()
      .insert(roles)
      .values({
        orgId: t.ids.org,
        key: 'r_viewer',
        name: 'Viewer',
        permissions: ['contacts.view'],
      });
    await adminDb().insert(users).values({
      id: ids.viewer,
      orgId: t.ids.org,
      email: 'v@acme.mn',
      role: 'r_viewer',
      status: 'active',
    });

    const owner = t.owner();

    vip = (await owner.tags.create({ name: 'VIP', type: 'customer' })).id;
    fields.spend = (
      await owner.fields.create({ contentType: 'customer', label: 'Spend', type: 'number' })
    ).id;
    fields.interests = (
      await owner.fields.create({
        contentType: 'customer',
        label: 'Interests',
        type: 'multiselect',
        options: ['golf', 'ski'],
      })
    ).id;

    ids.bat = (
      await owner.customers.create({
        firstName: 'Bat',
        state: 'lead',
        primaryEmail: 'bat@golf.mn',
        tagIds: [vip],
        birthDate: `1988-${monthDayIn(5)}`,
        customFields: { [fields.spend]: 1500, [fields.interests]: ['golf'] },
      })
    ).id;
    ids.dorj = (
      await owner.customers.create({
        firstName: 'Dorj',
        state: 'customer',
        ownerId: t.ids.member,
        customFields: { [fields.spend]: 200 },
      })
    ).id;
    ids.saraa = (
      await owner.customers.create({
        firstName: 'Saraa',
        state: 'customer',
        primaryEmail: 'saraa@shop.mn',
      })
    ).id;
    ids.retail = (
      await owner.companies.create({ primaryName: 'Retail Co', industry: 'Retail', size: 40 })
    ).id;
    await owner.companies.create({ primaryName: 'Lonely LLC', industry: 'Mining' });
    await owner.customers.linkCompany({ id: ids.saraa, companyId: ids.retail });

    // Dorj has been around for 40 days.
    await adminDb()
      .update(customers)
      .set({ createdAt: sql`now() - interval '40 days'` })
      .where(eq(customers.id, ids.dorj));
  });

  /** Names of the customers a filter finds, sorted. */
  const customersWhere = async (
    filter: ConditionGroup,
    as: CoreClient = t.owner(),
    query: { state?: 'lead' | 'customer' } = {},
  ) =>
    sorted(
      (await as.customers.list({ limit: 100, filter: JSON.stringify(filter), ...query })).data.map(
        (row) => row.firstName,
      ),
    );

  /** Names of the companies a filter finds, sorted. */
  const companiesWhere = async (filter: ConditionGroup) =>
    sorted(
      (await t.owner().companies.list({ limit: 100, filter: JSON.stringify(filter) })).data.map(
        (row) => row.primaryName,
      ),
    );

  return {
    ...t,
    contacts: ids,
    fields,
    vip: () => vip,
    viewer: () => t.client({ user: ids.viewer, org: t.ids.org }),
    customersWhere,
    companiesWhere,
  };
};
