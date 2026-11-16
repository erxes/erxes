import type { PluginManifest } from '@erxes/core-contract';
import { events, fields, pluginInstallations } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { rule } from './contacts.fixture';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

type Manifest = z.input<typeof PluginManifest>;

const SALES: Manifest = {
  title: 'Sales',
  version: '1.0.0',
  scopes: ['fields:write', 'views:read', 'customers:read'],
  fields: [
    { code: 'total_spent', contentType: 'customer', label: 'Total spent', type: 'number' },
    { code: 'last_order_at', contentType: 'customer', label: 'Last order', type: 'date' },
    {
      code: 'tier',
      contentType: 'customer',
      label: 'Tier',
      type: 'select',
      options: ['gold', 'silver'],
    },
    { code: 'orders', contentType: 'company', label: 'Orders', type: 'number' },
  ],
};

/** Plugin fields (rollups) and shared views as segments: the plugin declares, writes and asks. */
describe('plugin fields and segments', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const register = async (manifest: Manifest) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  const customerFields = async (client = t.owner(), archived = false) =>
    (await client.fields.list({ contentType: 'customer', archived })).data;

  const fieldId = async (code: string, client = t.owner()) => {
    const found = (await customerFields(client)).find(
      (field) => field.plugin && field.code === code,
    );

    if (!found) throw new Error(`no field ${code}`);

    return found.id;
  };

  it('keeps the manifest’s fields in every organisation that has the plugin', async () => {
    await register(SALES);

    for (const client of [t.owner(), t.other()]) {
      expect(
        (await customerFields(client)).map(({ code, plugin, pluginTitle, type }) => ({
          code,
          plugin,
          pluginTitle,
          type,
        })),
      ).toEqual([
        { code: 'total_spent', plugin: 'hr', pluginTitle: 'Sales', type: 'number' },
        { code: 'last_order_at', plugin: 'hr', pluginTitle: 'Sales', type: 'date' },
        { code: 'tier', plugin: 'hr', pluginTitle: 'Sales', type: 'select' },
      ]);
    }

    // A member's field may share a plugin field's label and code: they live apart.
    await t.owner().fields.create({
      contentType: 'customer',
      label: 'Tier',
      code: 'tier',
      type: 'text',
    });

    // Renamed, retyped options, one dropped: updated and archived, not duplicated.
    await register({
      ...SALES,
      fields: [
        { code: 'total_spent', contentType: 'customer', label: 'Lifetime value', type: 'number' },
        {
          code: 'tier',
          contentType: 'customer',
          label: 'Tier',
          type: 'select',
          options: ['gold', 'silver', 'bronze'],
        },
      ],
    });

    const after = (await customerFields()).filter((field) => field.plugin);

    expect(after.map(({ code, label, options }) => ({ code, label, options }))).toEqual([
      { code: 'total_spent', label: 'Lifetime value', options: [] },
      { code: 'tier', label: 'Tier', options: ['gold', 'silver', 'bronze'] },
    ]);
    expect(
      (await customerFields(t.owner(), true)).filter((field) => field.plugin).map((f) => f.code),
    ).toEqual(['last_order_at']);

    // Named again: it comes back with the same id.
    const archivedId = (await customerFields(t.owner(), true)).find(
      (field) => field.code === 'last_order_at',
    )?.id;

    await register(SALES);
    expect(await fieldId('last_order_at')).toBe(archivedId);
    expect((await customerFields()).filter((field) => field.plugin)).toHaveLength(3);
  });

  it('gives the fields to an organisation that installs the plugin later, or is new', async () => {
    // Never installed here: no fields until the owner installs it.
    await adminDb()
      .delete(pluginInstallations)
      .where(
        and(eq(pluginInstallations.orgId, t.ids.otherOrg), eq(pluginInstallations.plugin, 'hr')),
      );
    await adminDb()
      .delete(fields)
      .where(and(eq(fields.orgId, t.ids.otherOrg), eq(fields.plugin, 'hr')));
    await register({ ...SALES, version: '1.0.1' });
    expect((await customerFields(t.other())).filter((field) => field.plugin)).toEqual([]);

    await t.other().plugins.install({ name: 'hr' });
    expect((await customerFields(t.other())).filter((field) => field.plugin)).toHaveLength(3);

    const fresh = await createOrganization({
      subdomain: 'initech',
      name: 'Initech',
      owner: { email: 'owner@initech.mn' },
    });

    const initech = t.client({ user: fresh.owner.id, org: fresh.organization.id });

    expect((await customerFields(initech)).filter((field) => field.plugin)).toHaveLength(3);
  });

  it('leaves the fields and their values to the plugin', async () => {
    const id = await fieldId('total_spent');
    const owner = t.owner();

    await expect(owner.fields.update({ id, label: 'Mine' })).rejects.toMatchObject({
      status: 403,
      code: 'PLUGIN_FIELD',
      data: { fieldId: id, plugin: 'hr' },
    });
    // Hiding it is the members' choice.
    expect(await owner.fields.update({ id, isVisible: false })).toMatchObject({ isVisible: false });
    await owner.fields.update({ id, isVisible: true });

    const refused = { code: 'PLUGIN_FIELD' };

    await expect(owner.fields.archive({ ids: [id] })).rejects.toMatchObject(refused);
    await expect(owner.fields.restore({ id })).rejects.toMatchObject(refused);
    await expect(owner.fields.removeUnused({ ids: [id] })).rejects.toMatchObject(refused);
    await expect(owner.fields.remove({ id })).rejects.toMatchObject(refused);

    const customer = await owner.customers.create({ firstName: 'Saraa' });

    await expect(
      owner.customers.update({ id: customer.id, customFields: { [id]: 10 } }),
    ).rejects.toMatchObject({ code: 'PLUGIN_FIELD' });
    await expect(
      owner.customers.create({ firstName: 'Bold', customFields: { [id]: null } }),
    ).rejects.toMatchObject({ code: 'PLUGIN_FIELD' });
    // Members write values only through core's own fields.
    await expect(
      owner.fields.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: customer.id, code: 'total_spent', value: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
  });

  it('writes values quietly: no timeline entry, event or audit row', async () => {
    const owner = t.owner();
    const anu = await owner.customers.create({ firstName: 'Anu' });
    const theirs = await t.other().customers.create({ firstName: 'Anu' });
    const timeline = () => owner.activities.list({ targetType: 'customer', targetId: anu.id });
    const audit = () => owner.audit.list({ targetId: anu.id });

    const eventsOf = () =>
      adminDb().select({ type: events.type }).from(events).where(eq(events.subjectId, anu.id));

    const before = { timeline: await timeline(), audit: await audit(), events: await eventsOf() };

    expect(
      await t.hr().fields.setPluginValues({
        contentType: 'customer',
        values: [
          { recordId: anu.id, code: 'total_spent', value: 120 },
          { recordId: anu.id, code: 'total_spent', value: 150 },
          { recordId: anu.id, code: 'last_order_at', value: '2026-11-01' },
          { recordId: anu.id, code: 'tier', value: 'gold' },
          { recordId: theirs.id, code: 'total_spent', value: 999 },
          { recordId: 'nosuchcustomer000', code: 'total_spent', value: 1 },
        ],
      }),
    ).toEqual({ written: 3, skipped: [theirs.id, 'nosuchcustomer000'] });

    expect((await owner.customers.get({ id: anu.id })).customFields).toEqual({
      [await fieldId('total_spent')]: 150,
      [await fieldId('last_order_at')]: '2026-11-01',
      [await fieldId('tier')]: 'gold',
    });
    expect((await t.other().customers.get({ id: theirs.id })).customFields).toEqual({});
    expect(await timeline()).toEqual(before.timeline);
    expect(await audit()).toEqual(before.audit);
    expect(await eventsOf()).toEqual(before.events);

    // Null clears one; the rest stay.
    await t.hr().fields.setPluginValues({
      contentType: 'customer',
      values: [{ recordId: anu.id, code: 'tier', value: null }],
    });
    expect(Object.keys((await owner.customers.get({ id: anu.id })).customFields)).toHaveLength(2);

    await expect(
      t.hr().fields.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: anu.id, code: 'orders', value: 1 }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });
    await expect(
      t.hr().fields.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: anu.id, code: 'tier', value: 'platinum' }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_VALUE' });

    // Companies keep their own fields.
    const nomad = await owner.companies.create({ primaryName: 'Nomad LLC' });

    expect(
      await t.hr().fields.setPluginValues({
        contentType: 'company',
        values: [{ recordId: nomad.id, code: 'orders', value: 4 }],
      }),
    ).toEqual({ written: 1, skipped: [] });
    expect(Object.values((await owner.companies.get({ id: nomad.id })).customFields)).toEqual([4]);
  });

  it('filters lists by plugin fields, listed under the plugin in the picker', async () => {
    const owner = t.owner();
    const big = await owner.customers.create({ firstName: 'Big spender' });
    const small = await owner.customers.create({ firstName: 'Small spender' });

    await t.hr().fields.setPluginValues({
      contentType: 'customer',
      values: [
        { recordId: big.id, code: 'total_spent', value: 5000 },
        { recordId: small.id, code: 'total_spent', value: 20 },
      ],
    });

    const path = `subject.customFields.${await fieldId('total_spent')}`;

    const listed = await owner.customers.list({
      state: 'customer',
      filter: JSON.stringify(rule(path, 'gte', 1000)),
    });

    expect(listed.data.map((row) => row.id)).toEqual([big.id]);

    const picker = await owner.views.fields({ recordType: 'customer' });

    expect(picker.data.find((field) => field.path === path)).toMatchObject({
      label: 'Total spent',
      group: 'plugin',
      groupLabel: 'Sales',
    });
  });

  it('answers which records a shared view matches, for the plugin only', async () => {
    const owner = t.owner();
    const a = await owner.customers.create({ firstName: 'Gold Anu' });
    const b = await owner.customers.create({ firstName: 'Gold Bat' });
    const c = await owner.customers.create({ firstName: 'Silver Chimeg' });
    const theirs = await t.other().customers.create({ firstName: 'Gold Dorj' });

    await t.hr().fields.setPluginValues({
      contentType: 'customer',
      values: [a, b, c].map((row) => ({ recordId: row.id, code: 'total_spent', value: 2000 })),
    });

    const vip = await owner.views.create({
      name: 'VIP',
      recordType: 'customer',
      filter: rule(`subject.customFields.${await fieldId('total_spent')}`, 'gte', 1000),
      search: 'gold',
      shared: true,
    });

    const ids = [a.id, b.id, c.id, theirs.id, 'nosuchcustomer000'];

    expect((await t.hr().views.matches({ viewId: vip.id, recordIds: ids })).recordIds).toEqual(
      expect.arrayContaining([a.id, b.id]),
    );
    expect((await t.hr().views.matches({ viewId: vip.id, recordIds: ids })).recordIds).toHaveLength(
      2,
    );

    // The other organisation's plugin token sees none of Acme's views or records.
    await expect(
      t.hr(t.ids.otherOrg).views.matches({ viewId: vip.id, recordIds: [theirs.id] }),
    ).rejects.toMatchObject({ status: 404 });

    const personal = await t.member().views.create({ name: 'Mine', recordType: 'customer' });

    await expect(
      t.hr().views.matches({ viewId: personal.id, recordIds: [a.id] }),
    ).rejects.toMatchObject({ status: 403, code: 'VIEW_NOT_SHARED' });

    const products = await owner.views.create({ name: 'All', recordType: 'product', shared: true });

    await expect(
      t.hr().views.matches({ viewId: products.id, recordIds: [a.id] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_TYPE' });

    // A plugin lists the shared views only (to check the ids it stores).
    expect((await t.hr().views.list({ recordType: 'customer' })).data).toEqual([
      expect.objectContaining({ id: vip.id, name: 'VIP', recordType: 'customer', editable: false }),
    ]);
    // Members still see their own too.
    expect(
      (await t.member().views.list({ recordType: 'customer' })).data.map((view) => view.name),
    ).toEqual(['VIP', 'Mine']);

    await expect(owner.views.matches({ viewId: vip.id, recordIds: [a.id] })).rejects.toMatchObject({
      code: 'PLUGIN_ONLY',
    });
  });

  it('needs the scopes the manifest asks for', async () => {
    const owner = t.owner();

    const view = await owner.views.create({
      name: 'Everyone',
      recordType: 'customer',
      shared: true,
    });

    const anu = await owner.customers.create({ firstName: 'Anu' });

    await register({ ...SALES, version: '1.1.0', scopes: ['customers:read'] });

    await expect(
      t.hr().fields.setPluginValues({
        contentType: 'customer',
        values: [{ recordId: anu.id, code: 'total_spent', value: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(
      t.hr().views.matches({ viewId: view.id, recordIds: [anu.id] }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(t.hr().views.list({ recordType: 'customer' })).rejects.toMatchObject({
      code: 'SCOPE_REQUIRED',
    });
  });
});
