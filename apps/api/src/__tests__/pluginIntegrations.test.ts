import { pluginInstallations, pluginIntegrationStates, plugins } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { type CoreClient, useTwoOrgs } from './support';

const facebook = {
  key: 'facebook',
  name: 'Facebook',
  summary: 'Messenger and page comments in the inbox',
  category: 'social',
  permission: 'hr.integration.manage',
} as const;

/** The plugins' integrations the client's member sees. */
const listed = async (client: CoreClient) =>
  (await client.integrations.list()).data.filter((integration) => integration.plugin);

/** A plugin's integrations: its manifest declares them, it reports their state, core lists them. */
describe('plugin integrations', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '4',
      permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
      integrations: [facebook],
    });
  });

  it('lists a declared integration as not set up, then with the state the plugin reports', async () => {
    expect(await listed(t.owner())).toEqual([
      {
        ...facebook,
        plugin: 'hr',
        countries: [],
        dashboard: null,
        keyed: false,
        fields: [],
        payments: null,
        oauth: null,
        status: { state: 'not-set-up', count: null },
        actions: [],
      },
    ]);

    expect(
      await t.hr().integrations.report({ key: 'facebook', state: 'connected', count: 2 }),
    ).toEqual({ state: 'connected', count: 2 });
    expect((await listed(t.owner()))[0]?.status).toEqual({ state: 'connected', count: 2 });

    await t.hr().integrations.report({ key: 'facebook', state: 'attention' });
    expect((await listed(t.owner()))[0]?.status).toEqual({ state: 'attention', count: null });
  });

  it('keeps the state to its organisation and refuses a key the manifest does not declare', async () => {
    await t.hr().integrations.report({ key: 'facebook', state: 'connected', count: 1 });

    expect((await listed(t.other()))[0]?.status).toEqual({ state: 'not-set-up', count: null });
    await expect(
      t.hr().integrations.report({ key: 'instagram', state: 'connected' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(
      t.owner().integrations.report({ key: 'facebook', state: 'connected' }),
    ).rejects.toMatchObject({ status: 403, code: 'PLUGIN_ONLY' });
  });

  it('refuses a manifest whose integration needs a permission it does not declare', async () => {
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '5',
        integrations: [facebook],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PERMISSION',
      data: { permissions: ['hr.integration.manage'] },
    });
  });

  it('lists it only to members whose role manages integrations and holds its permission', async () => {
    const role = async (name: string, permissions: string[]) =>
      (await t.owner().roles.create({ name, permissions })).key;

    expect(await listed(t.member())).toEqual([]);

    await t.owner().users.update({
      id: t.ids.member,
      role: await role('Setup', ['integrations.manage']),
    });
    expect(await listed(t.member())).toEqual([]);

    await t.owner().users.update({
      id: t.ids.member,
      role: await role('Inbox setup', ['integrations.manage', 'hr.integration.manage']),
    });
    expect((await listed(t.member())).map((integration) => integration.key)).toEqual(['facebook']);
  });

  it('lists nothing to a member who holds the integration’s permission but may not manage integrations', async () => {
    const { key } = await t.owner().roles.create({
      name: 'Inbox only',
      permissions: ['hr.integration.manage'],
    });

    await t.owner().users.update({ id: t.ids.member, role: key });
    expect(await listed(t.member())).toEqual([]);
  });

  it('shows each state on its own plugin and key, and takes reports for any key the manifest declares', async () => {
    const instagram = { ...facebook, key: 'instagram', name: 'Instagram', summary: 'DMs' };

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '6',
      permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
      integrations: [facebook, instagram],
    });
    await adminDb().insert(plugins).values({ name: 'sales' }).onConflictDoNothing();
    await adminDb()
      .insert(pluginInstallations)
      .values({ orgId: t.ids.org, plugin: 'sales', grantedScopes: [] })
      .onConflictDoNothing();
    await adminDb().insert(pluginIntegrationStates).values({
      orgId: t.ids.org,
      plugin: 'sales',
      key: 'instagram',
      state: 'attention',
      count: 4,
    });

    const statuses = async () =>
      (await listed(t.owner())).map(({ key, status }) => ({ key, status }));

    expect(await statuses()).toEqual([
      { key: 'facebook', status: { state: 'connected', count: 1 } },
      { key: 'instagram', status: { state: 'not-set-up', count: null } },
    ]);

    await t.hr().integrations.report({ key: 'instagram', state: 'off' });
    expect(await statuses()).toEqual([
      { key: 'facebook', status: { state: 'connected', count: 1 } },
      { key: 'instagram', status: { state: 'off', count: null } },
    ]);
  });
});
