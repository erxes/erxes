import { apiKeys, auditLogs, roles, users } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { READ_CONTACTS, SETUP, tryCall } from './apiKeySupport';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const denials = (keyId: string) =>
  adminDb()
    .select({ metadata: auditLogs.metadata })
    .from(auditLogs)
    .where(and(eq(auditLogs.action, 'api_key.denied'), eq(auditLogs.targetId, keyId)));

describe('API key rules', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = { north: '', south: '', northCustomer: '', southCustomer: '', role: '' };

  /** A North and a South branch; the member is in North, the owner in South, one customer each. */
  beforeAll(async () => {
    const owner = t.owner();
    const north = await owner.units.create({ kind: 'branch', name: 'North' });
    const south = await owner.units.create({ kind: 'branch', name: 'South' });

    await owner.units.assign({ userId: t.ids.member, kind: 'branch', unitIds: [north.id] });
    await owner.units.assign({ userId: t.ids.owner, kind: 'branch', unitIds: [south.id] });

    const northCustomer = await owner.customers.create({
      firstName: 'Nora',
      ownerId: t.ids.member,
    });

    const southCustomer = await owner.customers.create({ firstName: 'Sam', ownerId: t.ids.owner });

    const role = await owner.roles.create({
      name: 'Reader',
      permissions: ['contacts.view', 'api_keys.create'],
    });

    await adminDb().update(users).set({ role: role.key }).where(eq(users.id, t.ids.member));

    Object.assign(ids, {
      north: north.id,
      south: south.id,
      northCustomer: northCustomer.id,
      southCustomer: southCustomer.id,
      role: role.key,
    });
  });

  it('keeps a regular key away from setup, and records the rule that refused it', async () => {
    const { apiKey, key } = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Data',
      areas: { contacts: 'write' },
      lifetimeDays: 30,
    });

    const client = t.client(key);

    expect((await client.customers.list({})).data.length).toBe(2);

    await expect(client.users.list({})).rejects.toMatchObject({
      status: 403,
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'kind:regular' },
    });
    await expect(client.roles.create({ name: 'X', permissions: [] })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
    await expect(client.webhooks.list()).rejects.toMatchObject({ code: 'KEY_NOT_ALLOWED' });
    // Keys never make keys.
    await expect(
      client.apiKeys.create({ ...READ_CONTACTS, name: 'Child', lifetimeDays: 30 }),
    ).rejects.toMatchObject({ code: 'KEY_NOT_ALLOWED', data: { rule: 'never' } });

    expect((await denials(apiKey.id)).map((row) => row.metadata)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ procedure: 'users.list', rule: 'kind:regular' }),
        expect.objectContaining({ procedure: 'apiKeys.create', rule: 'never' }),
      ]),
    );
  });

  it('keeps a management key away from customer data', async () => {
    const { key } = await t.owner().apiKeys.create({
      ...SETUP,
      name: 'Setup',
      lifetimeDays: 30,
    });

    const client = t.client(key);

    expect((await client.users.list({})).data.length).toBeGreaterThan(0);

    await expect(client.customers.list({})).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'kind:management' },
    });
    await expect(client.customers.get({ id: ids.northCustomer })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
    await expect(client.events.list({})).rejects.toMatchObject({ code: 'KEY_NOT_ALLOWED' });

    const found = await client.search.global({ q: 'Nora' });

    expect(found.data.filter((hit) => hit.type === 'customer')).toEqual([]);

    // Nor through a member it invites: it can't give a role that reads contacts.
    await expect(
      client.users.invite({ email: 'spy@acme.mn', role: ids.role }),
    ).rejects.toMatchObject({ status: 403, code: 'BEYOND_OWN_PERMISSIONS' });
  });

  it('lets only an owner or admin make a management key, and only one that expires', async () => {
    await expect(
      t.member().apiKeys.create({ ...SETUP, name: 'No', lifetimeDays: 30 }),
    ).rejects.toMatchObject({ code: 'OWNER_ONLY' });
    await expect(
      t.owner().apiKeys.create({ ...SETUP, name: 'Forever', lifetimeDays: null }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('hides other branches’ contacts from a branch key, in lists and by id', async () => {
    const { apiKey, key } = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'North only',
      areas: { contacts: 'write' },
      unitIds: [ids.north],
      lifetimeDays: 30,
    });

    const client = t.client(key);

    expect((await client.customers.list({})).data.map((row) => row.id)).toEqual([
      ids.northCustomer,
    ]);
    expect((await client.customers.get({ id: ids.northCustomer })).firstName).toBe('Nora');

    await expect(client.customers.get({ id: ids.southCustomer })).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      client.customers.update({ id: ids.southCustomer, firstName: 'Changed' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(
      (await client.search.global({ q: 'Sam' })).data.filter((hit) => hit.type === 'customer'),
    ).toEqual([]);

    // A contact it writes stays in its branch.
    await expect(
      client.customers.create({ firstName: 'Out', ownerId: t.ids.owner }),
    ).rejects.toMatchObject({ code: 'KEY_NOT_ALLOWED', data: { rule: 'rows' } });

    expect(
      await tryCall(t.owner(), { id: apiKey.id, recordId: ids.southCustomer }, 'customers.get'),
    ).toMatchObject({ allowed: false, rule: 'rows' });
    expect(
      await tryCall(t.owner(), { id: apiKey.id, recordId: ids.northCustomer }, 'customers.get'),
    ).toMatchObject({ allowed: true, rule: 'area:contacts:write' });
  });

  it('shows a tag key only contacts with its tags, customers and companies alike', async () => {
    const owner = t.owner();
    const vip = await owner.tags.create({ type: 'customer', name: 'Key VIP' });
    const partner = await owner.tags.create({ type: 'company', name: 'Key partner' });
    const tagged = await owner.customers.create({ firstName: 'Tagged', tagIds: [vip.id] });
    const plain = await owner.customers.create({ firstName: 'Plain' });

    const taggedCompany = await owner.companies.create({
      primaryName: 'Tagged Co',
      tagIds: [partner.id],
    });

    const plainCompany = await owner.companies.create({ primaryName: 'Plain Co' });

    const { key } = await owner.apiKeys.create({
      ...READ_CONTACTS,
      name: 'Tagged only',
      tagIds: [vip.id, partner.id],
      lifetimeDays: 30,
    });

    const client = t.client(key);
    const customerIds = (await client.customers.list({ limit: 100 })).data.map((row) => row.id);
    const companyIds = (await client.companies.list({ limit: 100 })).data.map((row) => row.id);

    expect(customerIds).toContain(tagged.id);
    expect(customerIds).not.toContain(plain.id);
    expect(companyIds).toEqual([taggedCompany.id]);
    await expect(client.companies.get({ id: plainCompany.id })).rejects.toMatchObject({
      status: 404,
    });

    // The member who made it, without a key, still sees every contact.
    const all = (await owner.companies.list({ limit: 100 })).data.map((row) => row.id);

    expect(all).toEqual(expect.arrayContaining([taggedCompany.id, plainCompany.id]));
  });

  it('refuses a key from an address it doesn’t allow, and an expired one', async () => {
    const far = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Office',
      allowedIps: ['203.0.113.0/24'],
      lifetimeDays: 30,
    });

    await expect(t.client(far.key).customers.list({})).rejects.toMatchObject({
      status: 403,
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'ip' },
    });
    expect((await denials(far.apiKey.id)).map((row) => row.metadata)).toEqual([
      expect.objectContaining({ rule: 'ip' }),
    ]);

    const near = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Here',
      allowedIps: ['127.0.0.1', '::1'],
      lifetimeDays: 30,
    });

    await t.client(near.key).customers.list({});

    await adminDb()
      .update(apiKeys)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(apiKeys.id, near.apiKey.id));
    await expect(t.client(near.key).customers.list({})).rejects.toMatchObject({ status: 401 });
    expect((await denials(near.apiKey.id)).map((row) => row.metadata)).toEqual([
      expect.objectContaining({ rule: 'expired' }),
    ]);
  });

  it('never does more than its maker could, then or now', async () => {
    // The member's role reads contacts only.
    await expect(
      t.member().apiKeys.create({
        ...READ_CONTACTS,
        name: 'Writer',
        areas: { contacts: 'write' },
        lifetimeDays: 30,
      }),
    ).rejects.toMatchObject({ code: 'BEYOND_OWN_PERMISSIONS' });

    const { key } = await t
      .member()
      .apiKeys.create({ ...READ_CONTACTS, name: 'Reader', lifetimeDays: 30 });

    await t.client(key).customers.list({});

    // The role loses contacts.view; so does the key.
    await adminDb()
      .update(roles)
      .set({ permissions: ['api_keys.create'] })
      .where(and(eq(roles.orgId, t.ids.org), eq(roles.key, ids.role)));

    await expect(t.client(key).customers.list({})).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'permission:contacts.view' },
    });

    // Given back later, it can't grow past what it had when made.
    await adminDb()
      .update(roles)
      .set({ permissions: ['contacts.view', 'contacts.create', 'api_keys.create'] })
      .where(and(eq(roles.orgId, t.ids.org), eq(roles.key, ids.role)));

    await t.client(key).customers.list({});
    await expect(t.client(key).customers.create({ firstName: 'No' })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
  });
});
