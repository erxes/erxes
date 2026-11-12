import { sql } from 'drizzle-orm';
import { decodeJwt, SignJWT } from 'jose';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { useTestServer } from './support';

const PLATFORM_TOKEN = 'erxes-io-platform-token-0123456789abcdefghij';
const HANDOFF_SECRET = 'erxes-io-jwt-token-secret-0123456789';
const ORG_ID = 'saasOrg0000000001';
const WORKSPACE = { organization: { subdomain: 'cloud', name: 'Cloud Co' } };

/** What erxes.io sends to create or change a workspace. */
interface WorkspaceBody {
  organization?: { subdomain: string; name: string };
  owner?: { email: string };
  status?: string;
}

/** What erxes.io's platform API answers about one subdomain's plugins. */
interface PlatformAnswer {
  status: string;
  details: { code: string; tier: string; status: string }[];
}

/** Exactly erxes.io's `workspaceUrl` token: HS256 `{ user: { email } }`, 5 minutes. */
const handoff = (email: string) =>
  new SignJWT({ user: { email } })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(HANDOFF_SECRET));

describeWithDb('SaaS: entitlements from erxes.io', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  let platform: Server;
  let platformUrl = '';

  /** What the fake erxes.io answers for `?subdomain=cloud`, as its real API does. */
  let answer: PlatformAnswer | 'down' = {
    status: 'active',
    details: [{ code: 'hr', tier: 'plus', status: 'active' }],
  };

  const platformCalls: string[] = [];
  /** The owner's browser, signed in through erxes.io's link. */
  let owner = server.browser();

  /** erxes.io → core. */
  const fromErxesIo = async (
    method: string,
    path: string,
    body?: WorkspaceBody,
    token = PLATFORM_TOKEN,
  ) => {
    const response = await fetch(server.url(`/core/v1/saas${path}`), {
      method,
      headers: { ...server.headers(token), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return {
      status: response.status,
      body: z.record(z.string(), z.unknown()).parse(await response.json()),
    };
  };

  const refresh = () => fromErxesIo('POST', `/organizations/${ORG_ID}/refresh`);
  const hr = async (org = ORG_ID) => server.client(await server.pluginToken(undefined, org));
  const plan = () => owner.api.saas.plan({});

  /** The status the plugin token endpoint answers for the organisation. */
  const tokenStatus = () =>
    server.pluginToken(undefined, ORG_ID).then(
      () => 200,
      (error: { status: number }) => error.status,
    );

  beforeAll(async () => {
    platform = createServer((req, res) => {
      platformCalls.push(`${req.headers.authorization} ${req.url}`);

      if (req.headers.authorization !== `Bearer ${PLATFORM_TOKEN}`) return res.writeHead(401).end();

      if (answer === 'down') return res.writeHead(503).end();

      if (!req.url?.includes('subdomain=cloud'))
        return res
          .writeHead(404, { 'content-type': 'application/json' })
          .end('{"error":"Not found"}');

      return res.writeHead(200, { 'content-type': 'application/json' }).end(
        JSON.stringify({
          subdomain: 'cloud',
          status: answer.status,
          plugins: Object.fromEntries(answer.details.map((row) => [row.code, row.tier])),
          details: answer.details,
        }),
      );
    }).listen(0);
    await once(platform, 'listening');

    const address = platform.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    platformUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    Object.assign(config.saas, {
      enabled: false,
      platformToken: undefined,
      handoffSecret: undefined,
    });
    platform.closeAllConnections();
    await new Promise<void>((resolve) => platform.close(() => resolve()));
  });

  it('self-hosted: no plan, every plugin at its top tier, no SaaS door', async () => {
    const self = await createOrganization({
      subdomain: 'selfhost',
      name: 'Self',
      owner: { email: 'o@self.mn' },
    });

    const member = server.client({ user: self.owner.id, org: self.organization.id });

    expect(await member.saas.plan({})).toMatchObject({ saas: false, plugins: [] });
    expect(await (await hr(self.organization.id)).saas.pluginPlan({})).toMatchObject({
      saas: false,
      tier: 'pro',
      access: 'full',
    });
    expect((await fromErxesIo('PUT', `/organizations/${ORG_ID}`, {})).status).toBe(404);
  });

  it('creates the workspace from erxes.io, reads its plugins and tiers, and signs the owner in with erxes.io’s link', async () => {
    Object.assign(config.saas, {
      enabled: true,
      platformUrl,
      platformToken: PLATFORM_TOKEN,
      handoffSecret: HANDOFF_SECRET,
      billingUrl: 'https://erxes.io/organizations/{subdomain}/billing',
    });

    const body = { ...WORKSPACE, owner: { email: 'owner@cloud.mn' } };

    expect((await fromErxesIo('PUT', `/organizations/${ORG_ID}`, body, 'wrong-token')).status).toBe(
      401,
    );

    const created = await fromErxesIo('PUT', `/organizations/${ORG_ID}`, body);

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      created: true,
      organizationStatus: 'active',
      plugins: [{ code: 'hr', tier: 'plus', status: 'active' }],
    });
    // Core asked erxes.io with its platform token.
    expect(platformCalls.at(-1)).toBe(
      `Bearer ${PLATFORM_TOKEN} /api/platform/organizations/plugins?subdomain=cloud`,
    );

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
    expect(await plan()).toMatchObject({
      saas: true,
      organizationStatus: 'active',
      plugins: [{ code: 'hr', tier: 'plus', status: 'active', access: 'full', installed: true }],
      manageUrl: 'https://erxes.io/organizations/cloud/billing',
    });

    // The plugin learns its tier, from core and in its members' session tokens.
    expect(await (await hr()).saas.pluginPlan({})).toMatchObject({ tier: 'plus', access: 'full' });
    expect(decodeJwt((await owner.api.plugins.session({ name: 'hr' })).token)).toMatchObject({
      tier: 'plus',
      access: 'full',
    });
  });

  it('keeps the last answer when erxes.io is down, and warns while a payment retries', async () => {
    answer = 'down';
    expect((await refresh()).body).toMatchObject({ plugins: [{ code: 'hr', tier: 'plus' }] });
    expect(await tokenStatus()).toBe(200);

    answer = { status: 'active', details: [{ code: 'hr', tier: 'plus', status: 'past_due' }] };
    await refresh();
    expect((await plan()).plugins[0]).toMatchObject({ status: 'past_due', access: 'warning' });
    // Writes pass the plan check: what stops this one is only the scope this
    // installation never granted, not READ_ONLY or a payment error.
    const plugin = await hr();

    expect(await plugin.saas.pluginPlan({})).toMatchObject({ access: 'warning' });
    await expect(
      plugin.notifications.create({ userIds: [], kind: 'hr.ping', title: 'x' }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
  });

  it('a plugin that leaves the plan is read-only for the grace days, then off; bought again, it is back', async () => {
    answer = { status: 'active', details: [] };
    await refresh();
    const [lapsed] = (await plan()).plugins;

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
    ).toMatchObject({ installed: false, statusReason: 'Not in your plan' });
    expect(await tokenStatus()).not.toBe(200);

    // Bought again (Pro this time).
    answer = { status: 'active', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    await refresh();
    expect((await plan()).plugins).toMatchObject([
      { code: 'hr', tier: 'pro', access: 'full', installed: true },
    ]);
    expect(await tokenStatus()).toBe(200);
  });

  it('a disabled workspace lets nobody in but its plan page', async () => {
    answer = { status: 'inactive', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    await refresh();

    const disabled = { code: 'ORGANIZATION_DISABLED' };

    await expect(owner.api.customers.list({})).rejects.toMatchObject(disabled);
    expect(await plan()).toMatchObject({ organizationStatus: 'inactive' });
    await expect((await hr()).saas.pluginPlan({})).rejects.toMatchObject(disabled);

    // erxes.io turns it back on itself (enable), no need to wait for the next check.
    answer = { status: 'active', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    expect(
      (await fromErxesIo('PUT', `/organizations/${ORG_ID}`, { ...WORKSPACE, status: 'active' }))
        .status,
    ).toBe(200);
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
