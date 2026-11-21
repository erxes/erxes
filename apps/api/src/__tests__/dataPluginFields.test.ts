import type { PluginManifest } from '@erxes/core-contract';
import { activities, events } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

type Manifest = z.input<typeof PluginManifest>;

const SALES: Manifest = {
  title: 'Sales',
  version: '1.0.0',
  scopes: ['fields:write', 'customers:read'],
  fields: [
    { code: 'total_spent', contentType: 'customer', label: 'Total spent', type: 'number' },
    { code: 'last_order_at', contentType: 'customer', label: 'Last order', type: 'date' },
    {
      code: 'tier',
      contentType: 'customer',
      label: 'Tier',
      type: 'select',
      options: ['gold', 'silver, plus'],
    },
    { code: 'orders', contentType: 'company', label: 'Orders', type: 'number', filterable: false },
  ],
};

/** A plugin's manifest `fields` as Data Extensions fields on customers and companies. */
describe('Data Extensions fields a plugin declares', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const register = async (manifest: Manifest) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  const fieldsOf = async (recordType: string, client = t.owner(), archived = false) =>
    (await client.dataFields.list({ recordType, archived })).data;

  const fieldOf = async (key: string) => {
    const found = (await fieldsOf('core.customer')).find((field) => field.key === key);

    if (!found) throw new Error(`no field ${key}`);

    return found;
  };

  it('makes a field per manifest field in every organisation, owned by the plugin', async () => {
    await register(SALES);

    for (const client of [t.owner(), t.other()]) {
      expect(
        (await fieldsOf('core.customer', client)).map(({ key, type, plugin, settings }) => ({
          key,
          type,
          plugin,
          readOnly: settings.readOnly,
        })),
      ).toEqual([
        { key: 'total_spent', type: 'number', plugin: 'hr', readOnly: true },
        { key: 'last_order_at', type: 'date', plugin: 'hr', readOnly: true },
        { key: 'tier', type: 'select', plugin: 'hr', readOnly: true },
      ]);
    }

    expect((await fieldOf('tier')).options).toEqual([
      { value: 'gold', label: 'gold', color: 'gray' },
      { value: 'silver  plus', label: 'silver, plus', color: 'gray' },
    ]);
    expect((await fieldsOf('core.company'))[0]?.settings).toMatchObject({ filterable: false });
  });

  it('leaves the fields to the plugin: members only place or hide them', async () => {
    const owner = t.owner();
    const spent = await fieldOf('total_spent');

    const refused = {
      status: 403,
      code: 'PLUGIN_FIELD',
      data: { fieldId: spent.id, plugin: 'hr' },
    };

    await expect(owner.dataFields.update({ id: spent.id, label: 'Mine' })).rejects.toMatchObject(
      refused,
    );
    await expect(owner.dataFields.archive({ id: spent.id })).rejects.toMatchObject(refused);
    await expect(
      owner.dataFields.update({ id: spent.id, settings: { ...spent.settings, hidden: true } }),
    ).resolves.toMatchObject({ settings: { hidden: true } });

    const customer = await owner.customers.create({ firstName: 'Saraa' });

    await expect(
      owner.customers.update({ id: customer.id, values: { total_spent: 5 } }),
    ).rejects.toMatchObject({ code: 'PLUGIN_FIELD' });
    await expect(
      owner.dataValues.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: customer.id, code: 'total_spent', value: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
  });

  it('writes the plugin’s values quietly, skipping records it doesn’t find', async () => {
    const owner = t.owner();
    const anu = await owner.customers.create({ firstName: 'Anu' });
    const theirs = await t.other().customers.create({ firstName: 'Anu' });

    const quiet = async () => ({
      history: await adminDb()
        .select({ id: activities.id })
        .from(activities)
        .where(eq(activities.targetId, anu.id)),
      events: await adminDb()
        .select({ id: events.id })
        .from(events)
        .where(eq(events.subjectId, anu.id)),
    });

    const before = await quiet();

    await expect(
      t.hr().dataValues.setPluginValues({
        contentType: 'customer',
        values: [
          { recordId: anu.id, code: 'total_spent', value: 120 },
          { recordId: anu.id, code: 'total_spent', value: 150 },
          { recordId: anu.id, code: 'last_order_at', value: '2026-11-01' },
          { recordId: anu.id, code: 'tier', value: 'silver, plus' },
          { recordId: theirs.id, code: 'total_spent', value: 999 },
        ],
      }),
    ).resolves.toEqual({ written: 3, skipped: [theirs.id] });

    expect(await owner.customers.get({ id: anu.id })).toMatchObject({
      values: { total_spent: 150, last_order_at: '2026-11-01', tier: 'silver  plus' },
    });
    expect((await t.other().customers.get({ id: theirs.id })).values.total_spent).toBeNull();
    expect(await quiet()).toEqual(before);

    await expect(
      t.hr().dataValues.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: anu.id, code: 'nope', value: 1 }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD', data: { fieldId: 'nope' } });
    await expect(
      t.hr().dataValues.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: anu.id, code: 'total_spent', value: 'lots' }],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FIELD_VALUE', data: { fieldId: 'total_spent' } });

    // Null or empty clears a value.
    await t.hr().dataValues.setPluginValues({
      contentType: 'customer',
      values: [{ recordId: anu.id, code: 'tier', value: '' }],
    });
    expect((await owner.customers.get({ id: anu.id })).values.tier).toBeNull();
  });

  it('archives a field the manifest drops, keeping its values; a new type clears them', async () => {
    const owner = t.owner();
    const [anu] = (await owner.customers.list({ search: 'Anu' })).data;

    if (!anu) throw new Error('no customer');

    await register({
      ...SALES,
      fields: [
        { code: 'total_spent', contentType: 'customer', label: 'Total spent', type: 'text' },
        { code: 'tier', contentType: 'customer', label: 'Tier', type: 'select', options: ['gold'] },
      ],
    });

    expect((await fieldsOf('core.customer', owner, true)).map((field) => field.key)).toEqual([
      'last_order_at',
    ]);
    expect((await owner.customers.get({ id: anu.id })).values).toMatchObject({
      total_spent: null,
      tier: null,
    });

    await register(SALES);

    const back = await owner.customers.get({ id: anu.id });

    expect(back.values).toMatchObject({ last_order_at: '2026-11-01', total_spent: null });
    expect((await fieldOf('total_spent')).type).toBe('number');
  });

  it('shows a plugin’s fields only while it is installed and may fill them', async () => {
    const owner = t.owner();
    const keys = async () => (await fieldsOf('core.customer')).map((field) => field.key);

    await owner.plugins.uninstall({ name: 'hr' });
    expect(await keys()).toEqual([]);
    expect(
      (await owner.views.fields({ recordType: 'customer' })).data.map((field) => field.path),
    ).not.toContain('subject.data.total_spent');
    // The other organisation still has it.
    expect((await fieldsOf('core.customer', t.other())).length).toBe(3);

    await owner.plugins.install({ name: 'hr' });
    expect(await keys()).toEqual(['total_spent', 'last_order_at', 'tier']);
  });
});
