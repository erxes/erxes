import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { READ_CONTACTS, SETUP } from './apiKeySupport';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('what Try this key says, and the refusal a key gets', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(async () => {
    await t.owner().customers.create({ firstName: 'Nora', ownerId: t.ids.owner });
  });

  const keyWith = async (rules: typeof READ_CONTACTS) =>
    t.owner().apiKeys.create({ ...rules, name: 'Key', lifetimeDays: 30 });

  /** "Try this key" for the procedures, each as `{ allowed, rule, reason }`. */
  const tried = async (id: string, procedures: string[]) => {
    const { data } = await t.owner().apiKeys.try({ id });

    return Object.fromEntries(
      procedures.map((procedure) => [
        procedure,
        data.flatMap(({ procedure: name, ...decision }) => (name === procedure ? [decision] : [])),
      ]),
    );
  };

  const customerHits = async (key: string) =>
    (await t.client(key).search.global({ q: 'Nora' })).data.filter(
      (hit) => hit.type === 'customer',
    );

  it('lets a read key read its area, and says why it refuses the rest', async () => {
    const { apiKey, key } = await keyWith(READ_CONTACTS);

    expect(
      await tried(apiKey.id, [
        'customers.list',
        'customers.create',
        'products.list',
        'users.list',
        'tags.list',
        'tags.create',
        'plugins.session',
      ]),
    ).toEqual({
      'customers.list': [
        { allowed: true, rule: 'area:contacts:read', reason: 'This key reads Contacts' },
      ],
      'customers.create': [
        { allowed: false, rule: 'area:contacts:read', reason: 'This key only reads Contacts' },
      ],
      'products.list': [
        { allowed: false, rule: 'area:products', reason: "This key doesn't open Products" },
      ],
      'users.list': [
        {
          allowed: false,
          rule: 'kind:regular',
          reason: 'Regular keys work with data; Team and roles is setup',
        },
      ],
      'tags.list': [
        { allowed: true, rule: 'lookup', reason: 'Every key reads lists like tags and units' },
      ],
      'tags.create': [
        {
          allowed: false,
          rule: 'kind:regular',
          reason: 'Regular keys work with data; Settings is setup',
        },
      ],
      'plugins.session': [
        { allowed: false, rule: 'plugins', reason: "This key doesn't open any plugin" },
      ],
    });

    const client = t.client(key);

    await expect(client.customers.create({ firstName: 'Lead' })).rejects.toMatchObject({
      status: 403,
      code: 'KEY_NOT_ALLOWED',
      message: 'This key only reads Contacts',
      data: { rule: 'area:contacts:read' },
    });
    await expect(
      client.apiKeys.create({ ...READ_CONTACTS, name: 'Child', lifetimeDays: 30 }),
    ).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      message: 'API keys cannot call this',
      data: { rule: 'never' },
    });
  });

  it('lets a write key write its area', async () => {
    const { apiKey, key } = await keyWith({ ...READ_CONTACTS, areas: { contacts: 'write' } });

    expect(await tried(apiKey.id, ['customers.create'])).toEqual({
      'customers.create': [
        {
          allowed: true,
          rule: 'area:contacts:write',
          reason: 'This key reads and writes Contacts',
        },
      ],
    });
    expect(await t.client(key).customers.create({ firstName: 'Lead' })).toMatchObject({
      firstName: 'Lead',
    });
  });

  it('keeps a management key to the setup it opens, with what it may only read', async () => {
    const { apiKey, key } = await keyWith(SETUP);

    expect(
      await tried(apiKey.id, [
        'customers.list',
        'plugins.session',
        'files.settings',
        'tags.create',
      ]),
    ).toEqual({
      'customers.list': [
        {
          allowed: false,
          rule: 'kind:management',
          reason: 'Management keys work with setup; Contacts is data',
        },
      ],
      'plugins.session': [
        {
          allowed: false,
          rule: 'kind:management',
          reason: 'Management keys work with setup; plugins are data',
        },
      ],
      'files.settings': [
        { allowed: true, rule: 'area:settings:read', reason: 'This key reads Settings' },
      ],
      'tags.create': [
        { allowed: false, rule: 'area:settings:read', reason: 'This key only reads Settings' },
      ],
    });

    const client = t.client(key);

    expect((await client.files.settings()).maxSizeMb).toBeGreaterThan(0);
    await expect(client.tags.create({ type: 'customer', name: 'VIP' })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'area:settings:read' },
    });
    await expect(t.client(key).plugins.session({ name: 'hr' })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      message: 'Management keys work with setup; plugins are data',
      data: { rule: 'kind:management' },
    });
  });

  it('says a key limited to some contacts can’t open plugins, by owner or by tag', async () => {
    const tag = await t.owner().tags.create({ type: 'customer', name: 'Decided VIP' });
    const own = await keyWith({ ...READ_CONTACTS, ownRecords: true });
    const tagged = await keyWith({ ...READ_CONTACTS, tagIds: [tag.id] });

    const limited = {
      allowed: false,
      rule: 'rows:plugins',
      reason: "Plugins don't follow this key's contact limits, so it can't open them",
    };

    expect(await tried(own.apiKey.id, ['plugins.session'])).toEqual({
      'plugins.session': [limited],
    });
    expect(await tried(tagged.apiKey.id, ['plugins.session'])).toEqual({
      'plugins.session': [limited],
    });
  });

  it('finds no contacts for a key that doesn’t read them, though its maker does', async () => {
    const found = await t.owner().search.global({ q: 'Nora' });

    expect(found.data.filter((hit) => hit.type === 'customer')).toHaveLength(1);

    const products = await keyWith({ ...READ_CONTACTS, areas: { products: 'read' } });

    const form = await keyWith({
      ...READ_CONTACTS,
      areas: {},
      actions: { contacts: ['customers.create'] },
    });

    expect(await customerHits(products.key)).toEqual([]);
    expect(await customerHits(form.key)).toEqual([]);
    expect(await tried(form.apiKey.id, ['customers.list'])).toEqual({
      'customers.list': [
        {
          allowed: false,
          rule: 'call:customers.list',
          reason: "This key wasn't given customers.list",
        },
      ],
    });
  });

  it('lists the permission each call needs, none for a call any member makes', async () => {
    const calls = (await t.owner().apiKeys.calls()).data;

    expect(calls.find((call) => call.procedure === 'customers.list')).toMatchObject({
      area: 'contacts',
      access: 'read',
      permission: 'contacts.view',
    });
    expect(calls.find((call) => call.procedure === 'units.list')).toMatchObject({
      area: 'lookup',
      access: 'read',
      permission: null,
    });
  });
});
