import { SignJWT } from 'jose';
import { createHmac, randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { config } from '~/config';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken, requestPluginToken } from './plugin';

const SECRET = 'saas-test-secret-0123456789abcdefghijklmnopqrstuv';

describeWithDb('SaaS plans (control plane → core)', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  const orgId = 'saasOrg0000000001';
  let version = 0;
  let cookie = '';

  const sign = (body: string) => {
    const t = Math.floor(Date.now() / 1000);

    return `t=${t},v1=${createHmac('sha256', SECRET).update(`${t}.${body}`).digest('hex')}`;
  };

  const push = async (patch: Record<string, unknown> = {}, signature?: string) => {
    version += 1;

    const body = JSON.stringify({
      version,
      organization: { subdomain: 'cloud', name: 'Cloud Co' },
      owner: { email: 'owner@cloud.mn', fullName: 'Owner' },
      subscription: { plan: 'growth', planName: 'Growth', status: 'active', currentPeriodEnd: new Date(Date.now() + 20 * 86_400_000).toISOString() },
      plugins: [{ name: 'hr', limits: { employees: 50 } }],
      limits: { teamMembers: 3, 'hr.departments': 5 },
      manageUrl: 'https://erxes.io/organizations/saasOrg0000000001/billing',
      ...patch,
    });
    const response = await fetch(`${base}/core/v1/saas/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'erxes-signature': signature ?? sign(body) },
      body,
    });

    return { status: response.status, body: (await response.json()) as Record<string, any> };
  };

  const call = async (method: string, path: string, body?: unknown, auth = cookie) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: {
        ...(auth.startsWith('erxes_session=') ? { cookie: auth, 'sec-fetch-site': 'same-origin' } : { authorization: `Bearer ${auth}` }),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const handoff = (email: string, jti: string = randomUUID()) =>
    new SignJWT({ org: orgId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('erxes-saas')
      .setAudience('erxes-core')
      .setJti(jti)
      .setIssuedAt()
      .setExpirationTime('1m')
      .sign(new TextEncoder().encode(SECRET));

  beforeAll(async () => {
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    Object.assign(config.saas, { enabled: false, secret: undefined });
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('self-hosted: no plan, no limits, no SaaS door', async () => {
    const other = await createOrganization({ subdomain: 'selfhost', name: 'Self', owner: { email: 'o@self.mn' } });
    const token = await currentToken(other.owner.id, other.organization.id);

    expect((await call('GET', '/plan', undefined, token)).body).toMatchObject({ saas: false, standing: 'ok', plan: null });
    expect((await push()).status).toBe(404);
    version = 0;
  });

  it('creates the organisation from the control plane, installs its plugins and signs the owner in from the dashboard', async () => {
    Object.assign(config.saas, { enabled: true, secret: SECRET });

    expect((await push({}, 't=1,v1=' + '0'.repeat(64))).status).toBe(401);
    version = 0;

    const created = await push();

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ applied: true, created: true, plugins: [{ plugin: 'hr', change: 'installed' }] });

    // A late, older update changes nothing.
    const stale = version;

    version = 0;
    expect((await push({ subscription: { plan: 'free', status: 'active' } })).body).toMatchObject({ applied: false });
    version = stale;

    // Dashboard hand-off: signs in once.
    const token = await handoff('OWNER@cloud.mn', 'jti-1');
    const first = await fetch(`${base}/core/v1/saas/login?token=${token}`, { redirect: 'manual' });

    expect(first.status).toBe(302);
    expect(first.headers.get('location')).toBe('/');
    cookie = (first.headers.getSetCookie().find((item) => item.startsWith('erxes_session=')) ?? '').split(';')[0]!;

    const again = await fetch(`${base}/core/v1/saas/login?token=${token}`, { redirect: 'manual' });

    expect(again.headers.get('location')).toMatch(/signin=failed/);
    expect(again.headers.getSetCookie()).toEqual([]);

    const plan = await call('GET', '/plan');

    expect(plan.body).toMatchObject({
      saas: true,
      standing: 'ok',
      plan: 'growth',
      planName: 'Growth',
      plugins: [{ name: 'hr', installed: true }],
      limits: expect.arrayContaining([{ key: 'teamMembers', limit: 3, used: 1 }]),
      manageUrl: expect.stringContaining('erxes.io'),
    });

    // The plugin reads its own limits.
    const hr = await pluginToken(base, orgId);

    expect((await call('GET', '/plan/plugin', undefined, hr)).body).toMatchObject({ included: true, limits: { employees: 50, departments: 5 } });
  });

  it('keeps the team within the plan', async () => {
    expect((await call('POST', '/users', { email: 'a@cloud.mn' })).status).toBe(201);
    expect((await call('POST', '/users', { email: 'b@cloud.mn' })).status).toBe(201);

    const over = await call('POST', '/users', { email: 'c@cloud.mn' });

    expect(over.status).toBe(402);
    expect(over.body).toMatchObject({ code: 'LIMIT_REACHED', data: { key: 'teamMembers', limit: 3, used: 3 } });
    expect((await call('POST', '/users/invitations', { entries: [{ email: 'd@cloud.mn' }, { email: 'e@cloud.mn' }] })).body.code).toBe('LIMIT_REACHED');
  });

  it('turns plugins off when the plan drops them and back on when it has them again', async () => {
    expect((await push({ plugins: [] })).body.plugins).toEqual([{ plugin: 'hr', change: 'removed' }]);
    expect((await requestPluginToken(base, orgId)).status).not.toBe(200);
    expect((await call('GET', '/plugins')).body.data.find((item: { name: string }) => item.name === 'hr')).toMatchObject({
      installed: false,
      statusReason: 'Not in your plan',
    });
    expect((await call('POST', '/plugins/hr/install', { scopes: [] })).body.code).toBe('NOT_IN_PLAN');

    expect((await push()).body.plugins).toEqual([{ plugin: 'hr', change: 'resumed' }]);
    expect((await requestPluginToken(base, orgId)).status).toBe(200);
  });

  it('goes read-only after the grace period, and suspended keeps everyone out', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const soon = new Date(Date.now() + 3 * 86_400_000).toISOString();

    // Unpaid, within grace: a warning, everything works.
    await push({ subscription: { plan: 'growth', status: 'past_due', currentPeriodEnd: past, graceUntil: soon } });
    expect((await call('GET', '/plan')).body).toMatchObject({ standing: 'warning', readOnlyAt: soon });
    expect((await call('POST', '/customers', { firstName: 'Bat' })).status).toBe(201);

    // Grace over: reads and sign-out yes, changes no.
    await push({ subscription: { plan: 'growth', status: 'expired', currentPeriodEnd: past, graceUntil: past } });
    expect((await call('GET', '/customers')).status).toBe(200);

    const refused = await call('POST', '/customers', { firstName: 'Dorj' });

    expect(refused.status).toBe(402);
    expect(refused.body).toMatchObject({ code: 'READ_ONLY', data: { manageUrl: expect.stringContaining('billing') } });
    expect((await call('POST', '/auth/onboarded')).status).toBe(200);

    // Suspended: only the plan page.
    await push({ suspended: true, suspendedReason: 'Unpaid for 60 days' });
    expect((await call('GET', '/customers')).body).toMatchObject({ code: 'ORGANIZATION_SUSPENDED', message: 'Unpaid for 60 days' });
    expect((await call('GET', '/plan')).body).toMatchObject({ standing: 'suspended', suspendedReason: 'Unpaid for 60 days' });
    expect((await requestPluginToken(base, orgId)).status).toBe(200);
    expect((await call('GET', '/plan/plugin', undefined, await pluginToken(base, orgId))).body.code).toBe('ORGANIZATION_SUSPENDED');

    // Paid again.
    await push();
    expect((await call('POST', '/customers', { firstName: 'Dorj' })).status).toBe(201);
  });

  it('reports usage to the control plane (signed)', async () => {
    const response = await fetch(`${base}/core/v1/saas/organizations/${orgId}`, { headers: { 'erxes-signature': sign('') } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: orgId, subdomain: 'cloud', usage: { teamMembers: 3 }, standing: 'ok' });
    expect((await fetch(`${base}/core/v1/saas/organizations/${orgId}`)).status).toBe(401);
  });
});
