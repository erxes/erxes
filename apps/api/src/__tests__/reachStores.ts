import { newId, users } from '@erxes/core-db';
import { beforeAll } from 'vite-plus/test';
import { adminDb } from './db';
import { type CoreClient, useTwoOrgs } from './support';

/** What a call outside the member's reach answers. */
export const OUTSIDE_REACH = { status: 403, code: 'OUTSIDE_REACH' };

/** The first names of the customers the caller's list shows, in order. */
export const customerNames = async (client: CoreClient) =>
  (await client.customers.list({ limit: 100 })).data
    .map((row) => row.firstName ?? '')
    .toSorted((a, b) => a.localeCompare(b));

/** The emails of the team members the caller's list shows, in order. */
export const teamEmails = async (client: CoreClient) =>
  (await client.users.list({ limit: 100 })).data
    .map((row) => row.email ?? '')
    .toSorted((a, b) => a.localeCompare(b));

/**
 * Acme with two districts: Store 1 and Store 2 in District 1, Store 3 in District 2. Each store
 * and each district has a manager (`unit` and `subtree` reach), Store 1 a sales rep (`own`).
 * Anna is Store 1's customer, Bold Store 2's, Chimeg Store 3's, and Dorj is in no store.
 */
export const useStores = () => {
  const t = useTwoOrgs();

  const ids = {
    district1: '',
    district2: '',
    store1: '',
    store2: '',
    store3: '',
    manager1: newId(),
    manager2: newId(),
    districtManager1: newId(),
    districtManager2: newId(),
    rep: newId(),
    anna: '',
    bold: '',
    chimeg: '',
    storeRole: '',
    districtRole: '',
    repRole: '',
  };

  const as = (user: string): CoreClient => t.client({ user, org: t.ids.org });

  const addRoles = async () => {
    const owner = t.owner();
    const contacts = ['contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete'];
    const store = [...contacts, 'contacts.export', 'team.view', 'api_keys.create'];

    const roles = {
      storeRole: await owner.roles.create({
        name: 'Store manager',
        reach: 'unit',
        permissions: store,
      }),
      districtRole: await owner.roles.create({
        name: 'District manager',
        reach: 'subtree',
        permissions: [...store, 'team.invite', 'team.manage', 'structure.manage'],
      }),
      repRole: await owner.roles.create({
        name: 'Sales rep',
        reach: 'own',
        permissions: ['contacts.view', 'contacts.create', 'contacts.edit'],
      }),
    };

    Object.assign(ids, {
      storeRole: roles.storeRole.key,
      districtRole: roles.districtRole.key,
      repRole: roles.repRole.key,
    });
  };

  const member = (id: string, email: string, role: string) => ({
    id,
    orgId: t.ids.org,
    email,
    role,
    status: 'active' as const,
  });

  const addMembers = () =>
    adminDb()
      .insert(users)
      .values([
        member(ids.manager1, 'store1@acme.mn', ids.storeRole),
        member(ids.manager2, 'store2@acme.mn', ids.storeRole),
        member(ids.districtManager1, 'district1@acme.mn', ids.districtRole),
        member(ids.districtManager2, 'district2@acme.mn', ids.districtRole),
        member(ids.rep, 'rep@acme.mn', ids.repRole),
      ]);

  const addUnits = async () => {
    const owner = t.owner();
    const district1 = await owner.units.create({ name: 'District 1' });
    const district2 = await owner.units.create({ name: 'District 2' });

    const store1 = await owner.units.create({
      name: 'Store 1',
      parentId: district1.id,
      memberIds: [ids.manager1, ids.rep],
    });

    const store2 = await owner.units.create({
      name: 'Store 2',
      parentId: district1.id,
      memberIds: [ids.manager2],
    });

    const store3 = await owner.units.create({ name: 'Store 3', parentId: district2.id });

    await owner.units.assign({ userId: ids.districtManager1, unitIds: [district1.id] });
    await owner.units.assign({ userId: ids.districtManager2, unitIds: [district2.id] });

    Object.assign(ids, {
      district1: district1.id,
      district2: district2.id,
      store1: store1.id,
      store2: store2.id,
      store3: store3.id,
    });
  };

  beforeAll(async () => {
    await addRoles();
    await addMembers();
    await addUnits();

    // Each store's manager adds a customer: it starts in their store.
    const anna = await as(ids.manager1).customers.create({
      firstName: 'Anna',
      primaryEmail: 'anna@x.mn',
    });

    const bold = await as(ids.manager2).customers.create({ firstName: 'Bold' });

    const chimeg = await t.owner().customers.create({
      firstName: 'Chimeg',
      unitIds: [ids.store3],
    });

    await t.owner().customers.create({ firstName: 'Dorj' });

    Object.assign(ids, { anna: anna.id, bold: bold.id, chimeg: chimeg.id });
  });

  return { t, ids, as };
};
