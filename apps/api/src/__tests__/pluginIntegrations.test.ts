import type { PluginManifest } from '@erxes/core-contract';
import { integrationConnections, secrets } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { adminDb, useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { type CoreClient, useTwoOrgs } from './support';

const facebook = {
  key: 'facebook',
  name: 'Facebook',
  summary: 'Messenger and page comments in the inbox',
  category: 'social',
  permission: 'hr.integration.manage',
} as const;

const qpay = {
  ...facebook,
  key: 'qpay',
  name: 'Their QPay',
  summary: 'Not core’s',
  category: 'payments',
} as const;

const hrManifest = (more: Partial<PluginManifest> = {}): PluginManifest => ({
  title: 'HR',
  version: '4',
  scopes: ['secrets:write'],
  permissions: [{ action: 'hr.integration.manage', label: 'Manage integrations' }],
  integrations: [facebook, qpay],
  ...more,
});

const notFound = { status: 404, code: 'NOT_FOUND' };

/** The plugins' integrations the client's member sees. */
const listed = async (client: CoreClient) =>
  (await client.integrations.list()).data.filter((integration) => integration.plugin);

const statusOf = async (client: CoreClient, key: string) =>
  (await listed(client)).find((integration) => integration.key === key)?.status;

const pluginRows = async (client: CoreClient) =>
  (await client.integrations.connections({})).data.filter((row) => row.plugin);

const sealedOf = async (connectionId: string) => {
  const [row] = await adminDb()
    .select({ secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId))
    .where(eq(integrationConnections.id, connectionId));

  return row?.secret;
};

/** A plugin's integrations: its manifest declares them, its saved secrets are their connections. */
describe('plugin integrations', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const tms = async (more: Partial<PluginManifest> = {}) => {
    const secret = await rotatePluginSecret('tms');

    const token = async (org?: string) =>
      (
        await t.client().plugins.token({
          grant_type: 'client_credentials',
          client_id: 'tms',
          client_secret: secret,
          org,
        })
      ).access_token;

    await t.client(await token()).plugins.registerManifest({
      title: 'TMS',
      version: '1',
      scopes: ['secrets:write', 'events:read'],
      permissions: [{ action: 'tms.integration.manage', label: 'Manage integrations' }],
      integrations: [{ ...facebook, permission: 'tms.integration.manage' }],
      ...more,
    });

    return t.client(await token(t.ids.org));
  };

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest(hrManifest());
  });

  it('shows a saved secret in the Vault and on its card, named and marked as the plugin’s, never its value', async () => {
    expect(await statusOf(t.owner(), 'facebook')).toEqual({ state: 'not-set-up', count: null });

    const app = await t
      .hr()
      .secrets.save({ key: 'facebook', name: 'Meta app', value: '{"appSecret":"s3cret-1"}' });

    expect(app).toMatchObject({
      key: 'facebook',
      name: 'Meta app',
      status: 'active',
      problem: null,
    });
    expect(await t.hr().secrets.read({ id: app.id })).toEqual({
      value: '{"appSecret":"s3cret-1"}',
    });

    const vault = await t.owner().integrations.connections({});

    expect(vault.data.filter((row) => row.plugin)).toEqual([
      {
        id: app.id,
        plugin: 'hr',
        key: 'facebook',
        name: 'Meta app',
        status: 'active',
        problem: null,
        createdAt: app.createdAt,
        settings: {},
        usedBy: ['HR'],
      },
    ]);
    expect(JSON.stringify(vault)).not.toContain('s3cret-1');
    expect(await statusOf(t.owner(), 'facebook')).toEqual({ state: 'connected', count: 1 });

    const sealed = await sealedOf(app.id);

    expect(sealed).toMatchObject({ owner: 'hr', orgId: t.ids.org });
    expect(JSON.stringify(sealed)).not.toContain('s3cret-1');

    expect(await pluginRows(t.other())).toEqual([]);
    expect(await statusOf(t.other(), 'facebook')).toEqual({ state: 'not-set-up', count: null });
  });

  it('says Needs attention with the plugin’s reason until it is fixed or given a new value', async () => {
    const page = await t
      .hr()
      .secrets.save({ key: 'facebook', name: 'Acme page', value: 'token-1' });

    const marked = await t.hr().secrets.mark({ id: page.id, problem: 'Page token expired' });

    expect(marked).toMatchObject({ status: 'attention', problem: 'Page token expired' });
    expect(await statusOf(t.owner(), 'facebook')).toMatchObject({ state: 'attention' });
    expect((await pluginRows(t.owner())).find((row) => row.id === page.id)).toMatchObject({
      status: 'attention',
      problem: 'Page token expired',
    });

    const renamed = await t.hr().secrets.replace({ id: page.id, name: 'Acme main page' });

    expect(renamed).toMatchObject({ name: 'Acme main page', status: 'attention' });

    const renewed = await t.hr().secrets.replace({ id: page.id, value: 'token-2' });

    expect(renewed).toMatchObject({ status: 'active', problem: null });
    expect(await t.hr().secrets.read({ id: page.id })).toEqual({ value: 'token-2' });
    expect(await statusOf(t.owner(), 'facebook')).toMatchObject({ state: 'connected' });

    await t.hr().secrets.mark({ id: page.id, problem: 'Page removed' });
    expect(await t.hr().secrets.mark({ id: page.id, problem: null })).toMatchObject({
      status: 'active',
      problem: null,
    });
  });

  it('lets only the plugin that saved it, in its organisation, read, change or delete it', async () => {
    const mine = await t.hr().secrets.save({ key: 'facebook', name: 'HR app', value: 'hr-only' });
    const other = await tms();

    const theirs = await other.secrets.save({
      key: 'facebook',
      name: 'TMS app',
      value: 'tms-only',
    });

    for (const client of [other, t.hr(t.ids.otherOrg)]) {
      await expect(client.secrets.read({ id: mine.id })).rejects.toMatchObject(notFound);
      await expect(client.secrets.replace({ id: mine.id, value: 'x' })).rejects.toMatchObject(
        notFound,
      );
      await expect(client.secrets.mark({ id: mine.id, problem: 'x' })).rejects.toMatchObject(
        notFound,
      );
      await expect(client.secrets.remove({ id: mine.id })).rejects.toMatchObject(notFound);
    }

    expect((await other.secrets.list({})).data.map((row) => row.name)).toEqual(['TMS app']);
    expect((await t.hr().secrets.list({ key: 'facebook' })).data.map((row) => row.id)).toContain(
      mine.id,
    );
    await expect(t.hr().secrets.read({ id: theirs.id })).rejects.toMatchObject(notFound);
    expect(await t.hr().secrets.read({ id: mine.id })).toEqual({ value: 'hr-only' });

    await expect(
      t.hr().secrets.save({ key: 'instagram', name: 'IG', value: 'x' }),
    ).rejects.toMatchObject(notFound);
    await expect(
      t.owner().secrets.save({ key: 'facebook', name: 'Mine', value: 'x' }),
    ).rejects.toMatchObject({ status: 403, code: 'PLUGIN_ONLY' });

    expect(await t.hr().secrets.remove({ id: mine.id })).toEqual({ ok: true });
    await expect(t.hr().secrets.read({ id: mine.id })).rejects.toMatchObject(notFound);
    expect(await sealedOf(mine.id)).toBeUndefined();
    expect(await other.secrets.read({ id: theirs.id })).toEqual({ value: 'tms-only' });
  });

  it('keeps a plugin integration named like one of core’s out of core’s', async () => {
    await t.hr().secrets.save({ key: 'qpay', name: 'HR QPay', value: 'not-json' });

    expect((await t.owner().integrations.connections({ key: 'qpay' })).data).toEqual([]);
    expect(
      (await t.owner().integrations.list()).data.find(
        (integration) => integration.key === 'qpay' && !integration.plugin,
      )?.status,
    ).toEqual({ state: 'not-set-up', count: null });
    expect((await pluginRows(t.owner())).map((row) => row.name)).toContain('HR QPay');
  });

  it('lets a member remove it, and tells only the plugin that saved it', async () => {
    const hrApi = await pluginApi(t.url(''));
    const tmsApi = await pluginApi(t.url(''), 'tms');

    try {
      await t.client(await t.pluginToken()).plugins.registerManifest(
        hrManifest({
          version: '5',
          api: { url: hrApi.url },
          subscriptions: ['core.integration.connection.removed'],
        }),
      );

      await tms({ version: '2', api: { url: tmsApi.url }, subscriptions: ['core.*'] });

      const app = await t.hr().secrets.save({ key: 'facebook', name: 'Doomed app', value: 'v' });

      await expect(
        t.owner().integrations.remove({ plugin: 'tms', key: 'facebook', id: app.id }),
      ).rejects.toMatchObject(notFound);
      await expect(
        t.member().integrations.remove({ plugin: 'hr', key: 'facebook', id: app.id }),
      ).rejects.toMatchObject(notFound);

      expect(
        await t.owner().integrations.remove({ plugin: 'hr', key: 'facebook', id: app.id }),
      ).toEqual({ ok: true });

      await expect(t.hr().secrets.read({ id: app.id })).rejects.toMatchObject(notFound);
      expect(await sealedOf(app.id)).toBeUndefined();
      expect((await pluginRows(t.owner())).map((row) => row.id)).not.toContain(app.id);

      await settle();

      expect(
        hrApi.received.filter((event) => event.type === 'core.integration.connection.removed'),
      ).toEqual([
        {
          type: 'core.integration.connection.removed',
          payload: { plugin: 'hr', key: 'facebook', id: app.id, name: 'Doomed app' },
        },
      ]);
      expect(tmsApi.received.map((event) => event.type)).not.toContain(
        'core.integration.connection.removed',
      );
    } finally {
      await Promise.all([hrApi.close(), tmsApi.close()]);
    }
  });

  it('refuses a manifest whose integration needs a permission it does not declare', async () => {
    await expect(
      t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '6',
        integrations: [facebook],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PERMISSION',
      data: { permissions: ['hr.integration.manage'] },
    });
  });

  it('shows its integrations and connections only to members whose role manages integrations and holds its permission', async () => {
    const role = async (name: string, permissions: string[]) =>
      (await t.owner().roles.create({ name, permissions })).key;

    expect(await listed(t.member())).toEqual([]);
    expect(await pluginRows(t.member())).toEqual([]);

    await t.owner().users.update({
      id: t.ids.member,
      role: await role('Setup', ['integrations.manage']),
    });
    expect(await listed(t.member())).toEqual([]);
    expect(await pluginRows(t.member())).toEqual([]);

    await t.owner().users.update({
      id: t.ids.member,
      role: await role('Only inbox', ['hr.integration.manage']),
    });
    expect(await listed(t.member())).toEqual([]);

    await t.owner().users.update({
      id: t.ids.member,
      role: await role('Inbox setup', ['integrations.manage', 'hr.integration.manage']),
    });
    expect((await listed(t.member())).map((integration) => integration.key)).toEqual([
      'facebook',
      'qpay',
    ]);
    expect((await pluginRows(t.member())).length).toBeGreaterThan(0);
  });
});
