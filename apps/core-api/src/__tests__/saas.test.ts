import { SignJWT } from 'jose';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { config } from '~/config';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken, requestPluginToken } from './plugin';

const PLATFORM_TOKEN = 'erxes-io-platform-token-0123456789abcdefghij';
const HANDOFF_SECRET = 'erxes-io-jwt-token-secret-0123456789';

/** What the fake erxes.io answers for `?subdomain=cloud`, as its real API does. */
let answer: { status: string; details: { code: string; tier: string; status: string }[] } | 'down' =
  {
    status: 'active',
    details: [{ code: 'hr', tier: 'plus', status: 'active' }],
  };

describeWithDb('SaaS: entitlements from erxes.io', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let platform: Server;
  let base = '';
  const orgId = 'saasOrg0000000001';
  let cookie = '';
  const platformCalls: string[] = [];

  const call = async (method: string, path: string, body?: unknown, auth = cookie) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: {
        ...(auth.startsWith('erxes_session=')
          ? { cookie: auth, 'sec-fetch-site': 'same-origin' }
          : { authorization: `Bearer ${auth}` }),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  /** erxes.io → core. */
  const fromErxesIo = async (
    method: string,
    path: string,
    body?: unknown,
    token = PLATFORM_TOKEN,
  ) => {
    const response = await fetch(`${base}/core/v1/saas${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: (await response.json()) as Record<string, any> };
  };

  /** Exactly erxes.io's `workspaceUrl` token: HS256 `{ user: { email } }`, 5 minutes. */
  const handoff = (email: string) =>
    new SignJWT({ user: { email } })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(HANDOFF_SECRET));

  const refresh = () => fromErxesIo('POST', `/organizations/${orgId}/refresh`);

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
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    Object.assign(config.saas, {
      enabled: false,
      platformToken: undefined,
      handoffSecret: undefined,
    });

    for (const each of [server, platform]) {
      each.closeAllConnections();
      await new Promise<void>((resolve) => each.close(() => resolve()));
    }
  });

  it('self-hosted: no plan, every plugin at its top tier, no SaaS door', async () => {
    const other = await createOrganization({
      subdomain: 'selfhost',
      name: 'Self',
      owner: { email: 'o@self.mn' },
    });

    const token = await currentToken(other.owner.id, other.organization.id);

    expect((await call('GET', '/plan', undefined, token)).body).toMatchObject({
      saas: false,
      plugins: [],
    });
    expect(
      (await call('GET', '/plan/plugin', undefined, await pluginToken(base, other.organization.id)))
        .body,
    ).toMatchObject({
      saas: false,
      tier: 'pro',
      access: 'full',
    });
    expect((await fromErxesIo('PUT', `/organizations/${orgId}`, {})).status).toBe(404);
  });

  it('creates the workspace from erxes.io, reads its plugins and tiers, and signs the owner in with erxes.io’s link', async () => {
    Object.assign(config.saas, {
      enabled: true,
      platformUrl: `http://127.0.0.1:${(platform.address() as AddressInfo).port}`,
      platformToken: PLATFORM_TOKEN,
      handoffSecret: HANDOFF_SECRET,
      billingUrl: 'https://erxes.io/organizations/{subdomain}/billing',
    });

    const body = {
      organization: { subdomain: 'cloud', name: 'Cloud Co' },
      owner: { email: 'owner@cloud.mn' },
    };

    expect((await fromErxesIo('PUT', `/organizations/${orgId}`, body, 'wrong-token')).status).toBe(
      401,
    );

    const created = await fromErxesIo('PUT', `/organizations/${orgId}`, body);

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

    const first = await fetch(`${base}/gateway/pl:core/core-login?token=${token}&isNext=true`, {
      redirect: 'manual',
      headers: { 'x-forwarded-host': 'cloud.next.erxes.io' },
    });

    expect(first.status).toBe(302);
    expect(first.headers.get('location')).toBe('/');
    cookie = (
      first.headers.getSetCookie().find((item) => item.startsWith('erxes_session=')) ?? ''
    ).split(';')[0]!;

    const again = await fetch(`${base}/core/v1/saas/login?token=${token}`, {
      redirect: 'manual',
      headers: { 'x-forwarded-host': 'cloud.next.erxes.io' },
    });

    expect(again.headers.get('location')).toMatch(/signin=failed/);

    expect((await call('GET', '/plan')).body).toMatchObject({
      saas: true,
      organizationStatus: 'active',
      plugins: [{ code: 'hr', tier: 'plus', status: 'active', access: 'full', installed: true }],
      manageUrl: 'https://erxes.io/organizations/cloud/billing',
    });

    // The plugin learns its tier, from core and in its members' session tokens.
    expect(
      (await call('GET', '/plan/plugin', undefined, await pluginToken(base, orgId))).body,
    ).toMatchObject({ tier: 'plus', access: 'full' });

    const session = await call('POST', '/plugins/hr/session');

    const claims = JSON.parse(
      Buffer.from(session.body.token.split('.')[1], 'base64url').toString(),
    );

    expect(claims).toMatchObject({ tier: 'plus', access: 'full' });
  });

  it('keeps the last answer when erxes.io is down, and warns while a payment retries', async () => {
    answer = 'down';
    expect((await refresh()).body).toMatchObject({ plugins: [{ code: 'hr', tier: 'plus' }] });
    expect((await requestPluginToken(base, orgId)).status).toBe(200);

    answer = { status: 'active', details: [{ code: 'hr', tier: 'plus', status: 'past_due' }] };
    await refresh();
    expect((await call('GET', '/plan')).body.plugins[0]).toMatchObject({
      status: 'past_due',
      access: 'warning',
    });
    expect(
      (
        await call(
          'POST',
          '/activities',
          { targetType: 'customer', targetId: 'x', type: 'hr.ping', summary: 'x' },
          await pluginToken(base, orgId),
        )
      ).status,
    ).not.toBe(402);
  });

  it('a plugin that leaves the plan is read-only for the grace days, then off; bought again, it is back', async () => {
    answer = { status: 'active', details: [] };
    await refresh();

    const plan = (await call('GET', '/plan')).body;

    expect(plan.plugins[0]).toMatchObject({
      code: 'hr',
      tier: null,
      access: 'read_only',
      readOnlyUntil: expect.any(String),
    });

    // Reads yes, changes no.
    const hr = await pluginToken(base, orgId);

    expect((await call('GET', '/plan/plugin', undefined, hr)).body).toMatchObject({
      access: 'read_only',
    });
    expect(
      (await call('POST', '/notifications', { userIds: [], kind: 'hr.ping', title: 'x' }, hr)).body
        .code,
    ).toBe('READ_ONLY');
    expect((await call('POST', '/plugins/hr/install', { scopes: [] })).body.code).toBe(
      'NOT_IN_PLAN',
    );

    // The grace period ends (as if 8 days passed): turned off at the next check.
    await adminDb().execute(
      (await import('drizzle-orm'))
        .sql`update core_entitlements set lapsed = jsonb_build_object('hr', (now() - interval '8 days')::text) where org_id = ${orgId}`,
    );
    await refresh();
    expect(
      (await call('GET', '/plugins')).body.data.find(
        (item: { name: string }) => item.name === 'hr',
      ),
    ).toMatchObject({
      installed: false,
      statusReason: 'Not in your plan',
    });
    expect((await requestPluginToken(base, orgId)).status).not.toBe(200);

    // Bought again (Pro this time).
    answer = { status: 'active', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    await refresh();
    expect((await call('GET', '/plan')).body.plugins).toEqual([
      expect.objectContaining({ code: 'hr', tier: 'pro', access: 'full', installed: true }),
    ]);
    expect((await requestPluginToken(base, orgId)).status).toBe(200);
  });

  it('a disabled workspace lets nobody in but its plan page', async () => {
    answer = { status: 'inactive', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    await refresh();

    expect((await call('GET', '/customers')).body.code).toBe('ORGANIZATION_DISABLED');
    expect((await call('GET', '/plan')).body).toMatchObject({ organizationStatus: 'inactive' });
    expect(
      (await call('GET', '/plan/plugin', undefined, await pluginToken(base, orgId))).body.code,
    ).toBe('ORGANIZATION_DISABLED');

    // erxes.io turns it back on itself (enable), no need to wait for the next check.
    answer = { status: 'active', details: [{ code: 'hr', tier: 'pro', status: 'active' }] };
    expect(
      (
        await fromErxesIo('PUT', `/organizations/${orgId}`, {
          organization: { subdomain: 'cloud', name: 'Cloud Co' },
          status: 'active',
        })
      ).status,
    ).toBe(200);
    expect((await call('GET', '/customers')).status).toBe(200);
  });

  it('reports the workspace and its usage to erxes.io', async () => {
    const usage = await fromErxesIo('GET', `/organizations/${orgId}`);

    expect(usage.body).toMatchObject({
      id: orgId,
      subdomain: 'cloud',
      organizationStatus: 'active',
      usage: { teamMembers: 1 },
    });
    expect((await fromErxesIo('GET', `/organizations/${orgId}`, undefined, 'nope')).status).toBe(
      401,
    );
  });
});
