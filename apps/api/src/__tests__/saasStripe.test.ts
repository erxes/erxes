import { users } from '@erxes/core-db';
import { verifyPluginSession } from '@erxes/plugin-sdk';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { signJwt } from '~/lib/signing';
import { adminDb, useTestDatabase } from './db';
import {
  bundleItem,
  CUSTOMER,
  nowSeconds,
  pluginItem,
  STRIPE_KEY,
  subscribed,
  untaggedBundle,
  useSaas,
} from './saasSupport';
import { useTestServer } from './support';

const ORG_ID = 'saasStripe0000001';
const TEN = 'business-school-10-people';

/** A session token for HR as core signs one, with these claims. */
const sign = (claims: Record<string, unknown>) =>
  signJwt(claims, {
    typ: 'erxes-plugin-session+jwt',
    audience: 'hr',
    subject: 'member-1',
    expiresInSeconds: 60,
  });

describe('SaaS: what a Stripe customer grants', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const saas = useSaas(server);
  const refresh = () => saas.fromErxesIo('POST', `/organizations/${ORG_ID}/refresh`);

  const hrPlan = async () =>
    server.client(await server.pluginToken(undefined, ORG_ID)).saas.pluginPlan({});

  it('reads free plugins, plugin and bundle items at their tiers, and the live bundle codes', async () => {
    saas.enable();
    saas.setStripe({
      metadata: { free_plugins: 'hr', plugin_tiers: 'hr:plus' },
      subscriptions: [
        {
          status: 'active',
          items: {
            data: [bundleItem(TEN, 'agent,frontline', 'agent:pro,frontline:plus'), untaggedBundle],
          },
        },
        // A canceled subscription grants nothing.
        { status: 'canceled', items: { data: [pluginItem('sales', 'pro')] } },
      ],
    });

    const created = await saas.fromErxesIo('PUT', `/organizations/${ORG_ID}`, {
      organization: { subdomain: 'stripe', name: 'Stripe Co' },
      owner: { email: 'owner@stripe.mn' },
      stripeCustomerId: CUSTOMER,
    });

    // A price without metadata takes its product's (Content from the untagged bundle).
    expect(created.body).toEqual({
      created: true,
      organizationStatus: 'active',
      plugins: [
        { code: 'agent', tier: 'pro', status: 'active', endsAt: null },
        { code: 'content', tier: 'pro', status: 'active', endsAt: null },
        { code: 'frontline', tier: 'plus', status: 'active', endsAt: null },
        { code: 'hr', tier: 'plus', status: 'active', endsAt: null },
      ],
      bundles: ['business-school-10-people', 'business-school-3-people'],
    });
    expect(saas.calls).toEqual([
      `Bearer ${STRIPE_KEY} /v1/customers/${CUSTOMER}`,
      `Bearer ${STRIPE_KEY} /v1/subscriptions?customer=${CUSTOMER}&status=all&limit=100`,
      `Bearer ${STRIPE_KEY} /v1/products/prod_bs3`,
    ]);

    expect(await hrPlan()).toEqual({
      saas: true,
      tier: 'plus',
      status: 'active',
      access: 'full',
      readOnlyUntil: null,
      bundles: ['business-school-10-people', 'business-school-3-people'],
    });

    // The same plan, in the owner's session token for the plugin.
    const [owner] = await adminDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'owner@stripe.mn'));

    const { token } = await server
      .client({ user: owner?.id ?? '', org: ORG_ID })
      .plugins.session({ name: 'hr' });

    expect(
      await verifyPluginSession(token, { coreUrl: server.url(''), plugin: 'hr' }),
    ).toMatchObject({
      tier: 'plus',
      access: 'full',
      saas: true,
      bundles: ['business-school-10-people', 'business-school-3-people'],
    });
  });

  it('a session token carries the plan, and one with a forged plan is refused', async () => {
    const coreUrl = server.url('');

    const session = {
      org: ORG_ID,
      role: 'member',
      permissions: [],
      tier: 'plus',
      access: 'full',
      saas: true,
      bundles: [TEN],
    };

    expect(await verifyPluginSession(await sign(session), { coreUrl, plugin: 'hr' })).toMatchObject(
      {
        saas: true,
        bundles: [TEN],
      },
    );

    for (const forged of [{ saas: undefined }, { bundles: undefined }, { bundles: TEN }]) {
      await expect(
        verifyPluginSession(await sign({ ...session, ...forged }), { coreUrl, plugin: 'hr' }),
      ).rejects.toThrow('not an erxes erxes-plugin-session+jwt token');
    }
  });

  it('counts a bundle bought twice twice; a removed item counts until its period ends; Tourism is TMS and PMS', async () => {
    const endsAt = nowSeconds() + 3600;

    saas.setStripe(
      subscribed(
        'active',
        pluginItem('hr', 'plus', 0, endsAt),
        pluginItem('tourism', 'plus'),
        bundleItem(TEN, 'agent', ''),
        bundleItem(TEN, 'agent', ''),
        {
          ...bundleItem('business-school-3-people', '', ''),
          quantity: 0,
          metadata: { ends_at: String(endsAt) },
        },
      ),
    );

    expect((await refresh()).body).toMatchObject({
      plugins: [
        { code: 'agent', tier: 'pro', status: 'active' },
        {
          code: 'hr',
          tier: 'plus',
          status: 'canceling',
          endsAt: new Date(endsAt * 1000).toISOString(),
        },
        { code: 'pms', tier: 'plus', status: 'active' },
        { code: 'tms', tier: 'plus', status: 'active' },
      ],
      bundles: [
        'business-school-10-people',
        'business-school-10-people',
        'business-school-3-people',
      ],
    });
    expect(await hrPlan()).toMatchObject({ status: 'canceling', access: 'warning' });

    // The period ended: the removed bundle is gone.
    saas.setStripe(subscribed('active', pluginItem('hr', 'plus'), bundleItem(TEN, 'agent', '')));
    expect(await refresh().then(() => hrPlan())).toMatchObject({ bundles: [TEN] });
  });

  it("reads new.erxes.io's own catalog kinds (xos_bundle, xos_plugin) like erxes.io's", async () => {
    saas.setStripe(
      subscribed(
        'active',
        bundleItem(TEN, 'agent,frontline', 'frontline:plus', 'xos_bundle'),
        pluginItem('sales', 'pro', 1, undefined, 'xos_plugin'),
      ),
    );

    expect((await refresh()).body).toMatchObject({
      plugins: [
        { code: 'agent', tier: 'pro', status: 'active' },
        { code: 'frontline', tier: 'plus', status: 'active' },
        { code: 'sales', tier: 'pro', status: 'active' },
      ],
      bundles: [TEN],
    });
  });

  it('a workspace without a Stripe customer has no plugins, and Stripe is not asked', async () => {
    const calls = saas.calls.length;

    const other = await saas.fromErxesIo('PUT', '/organizations/saasStripe0000002', {
      organization: { subdomain: 'nocustomer', name: 'No Customer' },
      owner: { email: 'owner@nocustomer.mn' },
    });

    expect(other.body).toMatchObject({ created: true, plugins: [], bundles: [] });
    expect(saas.calls).toHaveLength(calls);
  });
});
