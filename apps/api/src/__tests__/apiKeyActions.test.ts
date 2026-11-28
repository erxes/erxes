import { describe, expect, it } from 'vite-plus/test';
import { READ_CONTACTS, SETUP, tryCall } from './apiKeySupport';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const CONTACTS = { ...READ_CONTACTS, areas: {}, lifetimeDays: 30 } as const;

describe('API keys with chosen calls', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('adds customers with a key given only that call, and makes no other', async () => {
    const owner = t.owner();
    const existing = await owner.customers.create({ primaryEmail: 'known@example.com' });

    const { apiKey, key } = await owner.apiKeys.create({
      ...CONTACTS,
      name: 'Website form',
      actions: { contacts: ['customers.create'] },
    });

    expect(apiKey).toMatchObject({
      areas: { contacts: 'write' },
      actions: { contacts: ['customers.create'] },
    });

    const form = t.client(key);

    expect(await form.customers.create({ firstName: 'Lead' })).toMatchObject({ firstName: 'Lead' });

    await expect(form.customers.list({})).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'call:customers.list' },
    });

    await expect(
      form.customers.findOrCreate({ primaryEmail: 'known@example.com' }),
    ).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'call:customers.findOrCreate' },
    });

    await expect(form.customers.remove({ ids: [existing.id] })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'call:customers.remove' },
    });

    expect(await tryCall(owner, { id: apiKey.id }, 'customers.remove')).toMatchObject({
      allowed: false,
      rule: 'call:customers.remove',
    });
    expect(await tryCall(owner, { id: apiKey.id }, 'customers.create')).toMatchObject({
      allowed: true,
    });
  });

  it('lists and edits customers with a key that may not delete them', async () => {
    const owner = t.owner();
    const customer = await owner.customers.create({ firstName: 'Ana' });

    const { key } = await owner.apiKeys.create({
      ...CONTACTS,
      name: 'Sync',
      actions: { contacts: ['customers.list', 'customers.update'] },
    });

    const sync = t.client(key);

    expect((await sync.customers.list({})).data.map((row) => row.id)).toContain(customer.id);
    expect(await sync.customers.update({ id: customer.id, firstName: 'Anna' })).toMatchObject({
      firstName: 'Anna',
    });

    await expect(sync.customers.remove({ ids: [customer.id] })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'call:customers.remove' },
    });
  });

  it('names each call with a short title and keeps its rules in the description', async () => {
    const { data } = await t.owner().apiKeys.calls();

    const create = data.find((call) => call.procedure === 'productCategories.create');

    expect(create?.summary).toBe('Add a product category');
    expect(create?.description).toContain('409 TAKEN');
    expect(data.every((call) => call.summary && call.summary.length <= 48)).toBe(true);
  });

  it('keeps chosen calls that are all of a level as that level', async () => {
    const owner = t.owner();
    const calls = (await owner.apiKeys.calls()).data.filter((call) => call.area === 'contacts');

    const all = await owner.apiKeys.create({
      ...CONTACTS,
      name: 'All',
      actions: { contacts: calls.map((call) => call.procedure) },
    });

    expect(all.apiKey).toMatchObject({ areas: { contacts: 'write' }, actions: {} });

    const reading = await owner.apiKeys.create({
      ...CONTACTS,
      name: 'Reading',
      actions: {
        contacts: calls.filter((call) => call.access === 'read').map((call) => call.procedure),
      },
    });

    expect(reading.apiKey).toMatchObject({ areas: { contacts: 'read' }, actions: {} });
  });

  it('narrows a management key to the setup calls it was given', async () => {
    const { key } = await t.owner().apiKeys.create({
      ...SETUP,
      name: 'Inviter',
      areas: {},
      lifetimeDays: 30,
      actions: { team: ['users.list', 'users.invite'] },
    });

    const inviter = t.client(key);

    expect((await inviter.users.list({})).data.length).toBeGreaterThan(0);

    await expect(inviter.roles.create({ name: 'Boss', permissions: [] })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'call:roles.create' },
    });
  });

  it('refuses chosen calls a key can’t have', async () => {
    const owner = t.owner();

    await expect(
      owner.apiKeys.create({
        ...CONTACTS,
        name: 'Stranger',
        actions: { contacts: ['payments.refund'] },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    await expect(
      owner.apiKeys.create({
        ...CONTACTS,
        name: 'Never',
        actions: { contacts: ['audit.list'] },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    await expect(
      owner.apiKeys.create({
        ...CONTACTS,
        name: 'Wrong kind',
        actions: { team: ['users.list'] },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});
