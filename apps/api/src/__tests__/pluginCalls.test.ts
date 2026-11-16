import type { PluginManifest } from '@erxes/core-contract';
import {
  createCoreClient,
  PluginCallError,
  verifyPluginCall,
  verifyPluginSession,
} from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { config } from '~/config';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import { useTwoOrgs } from './support';

const READS = ['sales.deal.view', 'sales.pos_order.view'];

/** HR (the test plugin) reads deals and POS orders from sales. */
const hrManifest = (version: string): z.input<typeof PluginManifest> => ({
  title: 'HR',
  version,
  scopes: ['notifications:write'],
  pluginReads: [{ plugin: 'sales', permissions: READS, reason: 'Post sales to the ledger' }],
});

describe('one plugin reading another plugin API', { timeout: 60_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Sales' API: it accepts a plugin call as a member and says who called (401 otherwise). */
  const answer = async (path: string | undefined, authorization: string | undefined) => {
    const token = authorization?.slice('Bearer '.length) ?? '';

    const member = await verifyPluginCall(token, { coreUrl: t.url(''), plugin: 'sales' }).catch(
      () => null,
    );

    if (!member) return { status: 401, body: '' };

    return {
      status: 200,
      body: JSON.stringify({
        path,
        orgId: member.orgId,
        userId: member.userId,
        plugin: member.plugin,
        permissions: member.permissions,
        canView: member.can('sales.deal.view'),
        canManage: member.can('sales.deal.manage'),
        canChange: member.canChange(),
      }),
    };
  };

  const sales = createServer((req, res) => {
    void answer(req.url, req.headers.authorization).then(({ status, body }) =>
      res.writeHead(status, { 'content-type': 'application/json' }).end(body),
    );
  });

  let salesUrl = '';

  beforeAll(async () => {
    sales.listen(0, '127.0.0.1');
    await once(sales, 'listening');

    const address = sales.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    salesUrl = `http://127.0.0.1:${address.port}/api`;
  });

  afterAll(() => {
    sales.close();
  });

  /** Registers the sales plugin (installed everywhere: auto-install) with this manifest. */
  const registerSales = async (manifest: Partial<PluginManifest> = {}) => {
    const secret = await rotatePluginSecret('sales');
    const core = createCoreClient({ coreUrl: t.url(''), plugin: 'sales', clientSecret: secret });

    await core.registerManifest({
      title: 'Sales',
      version: '1.0.0',
      api: { url: salesUrl },
      scopes: [],
      permissions: [
        { action: 'sales.deal.view', label: 'View deals' },
        { action: 'sales.deal.manage', label: 'Manage deals' },
      ],
      ...manifest,
    });
  };

  const registerHr = async (version: string, manifest = hrManifest(version)) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  const hrCore = () =>
    createCoreClient({ coreUrl: t.url(''), plugin: 'hr', clientSecret: HR_SECRET });

  const hrListing = async (client = t.owner()) =>
    (await client.plugins.list({})).data.find((plugin) => plugin.name === 'hr');

  it("checks that reads name another plugin's own permissions", async () => {
    await expect(
      registerHr('1.0.0', {
        ...hrManifest('1.0.0'),
        pluginReads: [{ plugin: 'hr', permissions: ['hr.leave.view'], reason: 'Itself' }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'NAMESPACE_REQUIRED' });
    await expect(
      registerHr('1.0.0', {
        ...hrManifest('1.0.0'),
        pluginReads: [{ plugin: 'sales', permissions: ['ecom.order.view'], reason: 'Orders' }],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'NAMESPACE_REQUIRED' });
  });

  it('waits for the owner of each organisation to approve the reads', async () => {
    await registerSales();
    config.plugins.autoInstall = false;
    await registerHr('2.0.0').finally(() => {
      config.plugins.autoInstall = true;
    });

    const listing = await hrListing();

    expect(listing).toMatchObject({
      needsApproval: true,
      manifest: { pluginReads: [{ plugin: 'sales', permissions: READS }] },
    });
    expect(listing?.requestedScopes).toEqual(
      expect.arrayContaining(['reads:sales.deal.view', 'reads:sales.pos_order.view']),
    );
    await expect(t.hr().plugins.callToken({ name: 'sales' })).rejects.toMatchObject({
      status: 403,
      code: 'READ_NOT_APPROVED',
    });

    // Acme's owner approves; Globex's has not.
    await t.owner().plugins.install({ name: 'hr' });
    expect((await hrListing())?.needsApproval).toBe(false);
    expect(await t.hr().plugins.callToken({ name: 'sales' })).toMatchObject({
      apiUrl: salesUrl,
      // sales doesn't declare sales.pos_order.view, so the token leaves it out.
      permissions: ['sales.deal.view'],
    });
    expect((await hrListing(t.other()))?.needsApproval).toBe(true);
    await expect(t.hr(t.ids.otherOrg).plugins.callToken({ name: 'sales' })).rejects.toMatchObject({
      code: 'READ_NOT_APPROVED',
    });
  });

  it("reads the other plugin's API through the SDK as a member with the approved permissions", async () => {
    const core = hrCore();

    const response = await core.fetchPlugin(t.ids.org, 'sales', '/v1/deals/d1', {
      headers: { accept: 'application/json' },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      path: '/api/v1/deals/d1',
      orgId: t.ids.org,
      userId: 'plugin:hr',
      plugin: 'hr',
      permissions: ['sales.deal.view'],
      canView: true,
      canManage: false,
      canChange: true,
    });

    // Not approved in Globex: a typed error, and no request reaches sales.
    const refused = await core
      .fetchPlugin(t.ids.otherOrg, 'sales', '/v1/deals/d1')
      .catch((error: unknown) => error);

    expect(refused).toBeInstanceOf(PluginCallError);
    expect(refused).toMatchObject({ status: 403, code: 'READ_NOT_APPROVED' });
  });

  it('issues a token only the other plugin accepts, and only for a plugin call', async () => {
    const { token } = await t.hr().plugins.callToken({ name: 'sales' });
    const coreUrl = t.url('');

    expect(await verifyPluginCall(token, { coreUrl, plugin: 'sales' })).toMatchObject({
      orgId: t.ids.org,
      role: 'plugin',
    });
    await expect(verifyPluginCall(token, { coreUrl, plugin: 'ecom' })).rejects.toThrow(
      'unexpected "aud" claim value',
    );
    await expect(verifyPluginSession(token, { coreUrl, plugin: 'sales' })).rejects.toThrow(
      'unexpected "typ" JWT header value',
    );
    await expect(t.client(token).customers.list({})).rejects.toMatchObject({ status: 401 });

    // A member's session for sales is not a plugin call.
    const session = await t.member().plugins.session({ name: 'sales' });

    await expect(verifyPluginCall(session.token, { coreUrl, plugin: 'sales' })).rejects.toThrow(
      'unexpected "typ" JWT header value',
    );
  });

  it('refuses a plugin that is not installed here, or has no API', async () => {
    await expect(t.hr().plugins.callToken({ name: 'ecom' })).rejects.toMatchObject({
      status: 400,
      code: 'PLUGIN_NOT_INSTALLED',
    });
    await expect(t.hr().plugins.callToken({ name: 'hr' })).rejects.toMatchObject({
      code: 'READ_NOT_APPROVED',
    });

    await t.owner().plugins.uninstall({ name: 'sales' });
    await expect(hrCore().fetchPlugin(t.ids.org, 'sales', '/v1/deals/d1')).rejects.toMatchObject({
      status: 400,
      code: 'PLUGIN_NOT_INSTALLED',
    });
    await t.owner().plugins.install({ name: 'sales' });

    await registerSales({ api: undefined });
    await expect(t.hr().plugins.callToken({ name: 'sales' })).rejects.toMatchObject({
      status: 502,
      code: 'PLUGIN_UNREACHABLE',
    });
  });
});
