import { verifyPluginSession } from '@erxes/plugin-sdk';
import { sql } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import {
  CUSTOMER,
  HANDOFF_SECRET,
  nowSeconds,
  pluginItem,
  STRIPE_KEY,
  subscribed,
  useSaas,
} from './saasSupport';
import { useTestServer } from './support';

const ORG_ID = 'saasOrg0000000001';
const WORKSPACE = { organization: { subdomain: 'cloud', name: 'Cloud Co' } };

/** Exactly erxes.io's `workspaceUrl` token: HS256 `{ user: { email } }`, 5 minutes. */
const handoff = (email: string) =>
  new SignJWT({ user: { email } })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(HANDOFF_SECRET));

describe('SaaS: entitlements from the Stripe customer', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const saas = useSaas(server);
  const { fromErxesIo } = saas;

  /** The owner's browser, signed in through erxes.io's link. */
  let owner = server.browser();

  const refresh = () => fromErxesIo('POST', `/organizations/${ORG_ID}/refresh`);
  const hr = async (org = ORG_ID) => server.client(await server.pluginToken(undefined, org));
  const plan = () => owner.api.saas.plan({});
  const hrEntry = async () => (await plan()).plugins.find((item) => item.code === 'hr');

  /** The status the plugin token endpoint answers for the organisation. */
  const tokenStatus = () =>
    server.pluginToken(undefined, ORG_ID).then(
      () => 200,
      (error: { status: number }) => error.status,
    );

  it('self-hosted: no plan, every plugin at its top tier, no bundles, no SaaS door', async () => {
    const self = await createOrganization({
      subdomain: 'selfhost',
      name: 'Self',
      owner: { email: 'o@self.mn' },
    });

    const member = server.client({ user: self.owner.id, org: self.organization.id });

    expect(await member.saas.plan({})).toMatchObject({ saas: false, plugins: [] });
    expect(await (await hr(self.organization.id)).saas.pluginPlan({})).toEqual({
      saas: false,
      tier: 'pro',
      status: null,
      access: 'full',
      readOnlyUntil: null,
      bundles: [],
    });

    const { token } = await member.plugins.session({ name: 'hr' });

    expect(
      await verifyPluginSession(token, { coreUrl: server.url(''), plugin: 'hr' }),
    ).toMatchObject({ tier: 'pro', access: 'full', saas: false, bundles: [] });
    expect((await fromErxesIo('PUT', `/organizations/${ORG_ID}`, {})).status).toBe(404);
  });

  it('creates the workspace from erxes.io, reads its Stripe customer, and signs the owner in with erxes.io’s link', async () => {
    saas.enable();
    saas.setStripe({
      metadata: { free_plugins: 'hr', plugin_tiers: 'hr:plus' },
      subscriptions: [],
    });

    const body = { ...WORKSPACE, owner: { email: 'owner@cloud.mn' }, stripeCustomerId: CUSTOMER };

    expect((await fromErxesIo('PUT', `/organizations/${ORG_ID}`, body, 'wrong-token')).status).toBe(
      401,
    );

    const created = await fromErxesIo('PUT', `/organizations/${ORG_ID}`, body);

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      created: true,
      organizationStatus: 'active',
      plugins: [{ code: 'hr', tier: 'plus', status: 'active' }],
      bundles: [],
    });
    // Core read the customer with its Stripe key.
    expect(saas.calls.at(0)).toBe(`Bearer ${STRIPE_KEY} /v1/customers/${CUSTOMER}`);

    // erxes.io's link opens the workspace once (the organisation from the address).
    const token = await handoff('OWNER@cloud.mn');
    const host = { 'x-forwarded-host': 'cloud.next.erxes.io' };

    const first = await fetch(
      server.url(`/gateway/pl:core/core-login?token=${token}&isNext=true`),
      { redirect: 'manual', headers: host },
    );

    expect(first.status).toBe(302);
    expect(first.headers.get('location')).toBe('/');
    owner = server.browser(
      first.headers
        .getSetCookie()
        .find((item) => item.startsWith('erxes_session='))
        ?.split(';')[0],
    );

    const again = await fetch(server.url(`/core/v1/saas/login?token=${token}`), {
      redirect: 'manual',
      headers: host,
    });

    expect(again.headers.get('location')).toMatch(/signin=failed/);
    // The plan installs the plugins and grants their access: no Settings › Plugins.
    expect(await plan()).toMatchObject({
      saas: true,
      pluginsManaged: true,
      organizationStatus: 'active',
      plugins: [{ code: 'hr', tier: 'plus', status: 'active', access: 'full', installed: true }],
      manageUrl: 'https://erxes.io/organizations/cloud/billing',
    });
    expect(await (await hr()).saas.pluginPlan({})).toMatchObject({ tier: 'plus', access: 'full' });
  });

  it('keeps the last answer when Stripe is down, and warns while a payment retries', async () => {
    saas.setStripe('down');
    expect((await refresh()).body).toMatchObject({ plugins: [{ code: 'hr', tier: 'plus' }] });
    expect(await tokenStatus()).toBe(200);

    saas.setStripe(subscribed('past_due', pluginItem('hr', 'plus')));
    await refresh();
    expect(await hrEntry()).toMatchObject({ status: 'past_due', access: 'warning' });
    // A payment that retries only warns: the plugin's writes still go through.
    const plugin = await hr();
    const { user } = await owner.api.auth.me({});

    expect(await plugin.saas.pluginPlan({})).toMatchObject({ access: 'warning' });
    expect(
      await plugin.notifications.create({ userIds: [user.id], kind: 'hr.ping', title: 'x' }),
    ).toMatchObject({ created: 1 });
  });

  it('a plugin that leaves the plan is read-only for the grace days, then off; bought again, it is back', async () => {
    // Removed, and its period ended: the item grants nothing now.
    saas.setStripe(subscribed('active', pluginItem('hr', 'plus', 0, nowSeconds() - 60)));
    await refresh();
    const lapsed = await hrEntry();

    expect(lapsed).toMatchObject({ code: 'hr', tier: null, access: 'read_only' });
    expect(lapsed?.readOnlyUntil).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Reads yes, changes no.
    const plugin = await hr();

    expect(await plugin.saas.pluginPlan({})).toMatchObject({ access: 'read_only' });
    await expect(
      plugin.notifications.create({ userIds: [], kind: 'hr.ping', title: 'x' }),
    ).rejects.toMatchObject({ code: 'READ_ONLY' });
    await expect(owner.api.plugins.install({ name: 'hr' })).rejects.toMatchObject({
      code: 'NOT_IN_PLAN',
    });

    // The grace period ends (as if 8 days passed): turned off at the next check.
    await adminDb().execute(
      sql`update core_entitlements set lapsed = jsonb_build_object('hr', (now() - interval '8 days')::text) where org_id = ${ORG_ID}`,
    );
    await refresh();
    expect(
      (await owner.api.plugins.list({})).data.find((item) => item.name === 'hr'),
    ).toMatchObject({ installation: { status: 'disabled', statusReason: 'Not in your plan' } });
    expect(await tokenStatus()).not.toBe(200);

    // Bought again (Pro this time).
    saas.setStripe(subscribed('active', pluginItem('hr', 'pro')));
    await refresh();
    expect((await plan()).plugins).toMatchObject([
      { code: 'hr', tier: 'pro', access: 'full', installed: true },
    ]);
    expect(await tokenStatus()).toBe(200);
  });

  it('gives a plan’s plugin everything it asks for, with no approval on Settings › Plugins', async () => {
    const scopesIn = async (org: string) => {
      const token = await server.client().plugins.token({
        grant_type: 'client_credentials',
        client_id: 'hr',
        client_secret: HR_SECRET,
        org,
      });

      return token.scope?.split(' ') ?? [];
    };

    // A newer version asks to use the Facebook connection: granted where the plan installed it.
    await server.client(await server.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '9.0.0',
      scopes: ['notifications:write'],
      connections: [{ integration: 'facebook', reason: 'Messenger in the inbox' }],
    });

    expect(
      (await owner.api.plugins.list({})).data.find((item) => item.name === 'hr'),
    ).toMatchObject({ needsApproval: false });
    expect(await scopesIn(ORG_ID)).toContain('uses:facebook');

    // A workspace erxes.io creates now gets it at install.
    const second = 'saasOrg0000000002';

    expect(
      (
        await fromErxesIo('PUT', `/organizations/${second}`, {
          organization: { subdomain: 'second', name: 'Second Co' },
          owner: { email: 'owner@second.mn' },
          stripeCustomerId: CUSTOMER,
        })
      ).status,
    ).toBe(201);
    expect(await scopesIn(second)).toEqual(
      expect.arrayContaining(['notifications:write', 'uses:facebook']),
    );
  });

  it('a disabled workspace lets nobody in but its plan page', async () => {
    expect(
      (await fromErxesIo('PUT', `/organizations/${ORG_ID}`, { ...WORKSPACE, status: 'inactive' }))
        .status,
    ).toBe(200);

    const disabled = { code: 'ORGANIZATION_DISABLED' };

    await expect(owner.api.customers.list({})).rejects.toMatchObject(disabled);
    expect(await plan()).toMatchObject({ organizationStatus: 'inactive' });
    await expect((await hr()).saas.pluginPlan({})).rejects.toMatchObject(disabled);

    // erxes.io turns it back on (enable); the Stripe customer it named stays.
    expect(
      (await fromErxesIo('PUT', `/organizations/${ORG_ID}`, { ...WORKSPACE, status: 'active' }))
        .body,
    ).toMatchObject({ plugins: [{ code: 'hr', tier: 'pro', status: 'active' }] });
    expect((await owner.api.customers.list({})).totalCount).toBe(0);
  });

  it('reports the workspace and its usage to erxes.io', async () => {
    expect((await fromErxesIo('GET', `/organizations/${ORG_ID}`)).body).toMatchObject({
      id: ORG_ID,
      subdomain: 'cloud',
      organizationStatus: 'active',
      usage: { teamMembers: 1 },
    });
    expect((await fromErxesIo('GET', `/organizations/${ORG_ID}`, undefined, 'nope')).status).toBe(
      401,
    );
  });
});
