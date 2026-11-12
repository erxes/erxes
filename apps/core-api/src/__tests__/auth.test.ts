import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { processJobs } from '~/modules/jobs/jobs';
import { JOBS } from '~/modules/jobs/registry';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('sign-in (/core/v1/auth)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', passwordHash: await hashPassword('correct horse') },
    });
    // The same email in a second organisation
    await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'shared@x.mn', passwordHash: await hashPassword('pw-globex') },
    });
    await createOrganization({
      subdomain: 'initech',
      name: 'Initech',
      owner: { email: 'shared@x.mn', passwordHash: await hashPassword('pw-initech') },
    });

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const signIn = (body: Record<string, unknown>) =>
    fetch(`${base}/core/v1/auth/sign-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  const sessionCookie = (response: Response) =>
    (
      response.headers.getSetCookie().find((cookie) => cookie.startsWith('erxes_session=')) ?? ''
    ).split(';')[0] ?? '';

  it('signs in, sets an HttpOnly session cookie and answers /me with it', async () => {
    const response = await signIn({ email: 'OWNER@acme.mn', password: 'correct horse' });

    const body = (await response.json()) as {
      user: { email: string; role: string };
      organization: { subdomain: string };
    };

    const setCookie = response.headers.getSetCookie().join(';');

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({ email: 'owner@acme.mn', role: 'owner' });
    expect(body.organization.subdomain).toBe('acme');
    expect(setCookie).toMatch(/erxes_session=.*HttpOnly.*SameSite=Lax/i);

    const me = await fetch(`${base}/core/v1/auth/me`, {
      headers: { cookie: sessionCookie(response) },
    });

    expect(me.status).toBe(200);
  });

  it('remembers the welcome steps on the member, not the browser', async () => {
    const cookie = sessionCookie(
      await signIn({ email: 'owner@acme.mn', password: 'correct horse' }),
    );

    const headers = { cookie, 'sec-fetch-site': 'same-origin' };

    const before = (await (await fetch(`${base}/core/v1/auth/me`, { headers })).json()) as {
      user: { onboardedAt: string | null };
    };

    expect(before.user.onboardedAt).toBeNull();

    const done = (await (
      await fetch(`${base}/core/v1/auth/onboarded`, { method: 'POST', headers })
    ).json()) as { user: { onboardedAt: string } };

    expect(done.user.onboardedAt).toEqual(expect.any(String));

    // Again: the first time is kept.
    const again = (await (
      await fetch(`${base}/core/v1/auth/onboarded`, { method: 'POST', headers })
    ).json()) as { user: { onboardedAt: string } };

    expect(again.user.onboardedAt).toBe(done.user.onboardedAt);
  });

  it('fills a fresh organisation with example data once, for its owner', async () => {
    await createOrganization({
      subdomain: 'umbrella',
      name: 'Umbrella',
      owner: { email: 'owner@umbrella.mn', passwordHash: await hashPassword('pw-umbrella') },
    });

    const cookie = sessionCookie(
      await signIn({ email: 'owner@umbrella.mn', password: 'pw-umbrella' }),
    );

    const headers = { cookie, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' };

    const get = async (path: string) =>
      (await (await fetch(`${base}/core/v1${path}`, { headers })).json()) as {
        totalCount: number;
        data: { name?: string; primaryName?: string; firstName?: string }[];
      };

    const onboard = () =>
      fetch(`${base}/core/v1/auth/onboarded`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ exampleData: true, language: 'mn' }),
      });

    expect((await onboard()).status).toBe(200);
    // Seeded by a job, right after.
    await processJobs(JOBS);
    expect((await get('/customers?state=customer')).totalCount).toBe(5);
    expect((await get('/customers?state=lead')).totalCount).toBe(5);
    expect((await get('/companies')).data.map((company) => company.primaryName)).toContain(
      'Хангай Трейд ХХК',
    );
    expect((await get('/views?recordType=customer')).data.map((view) => view.name)).toEqual([
      'VIP харилцагчид',
    ]);
    expect((await get('/automations')).data).toHaveLength(1);

    // Again (another browser, a second click): nothing more.
    await onboard();
    await processJobs(JOBS);
    expect((await get('/customers?state=customer')).totalCount).toBe(5);
    expect((await get('/companies')).totalCount).toBe(4);
  }, 600_000);

  it('answers wrong password and unknown email the same way', async () => {
    const wrong = await signIn({ email: 'owner@acme.mn', password: 'nope' });
    const unknown = await signIn({ email: 'nobody@acme.mn', password: 'nope' });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it('asks for the organisation when the email exists in several', async () => {
    const ambiguous = await signIn({ email: 'shared@x.mn', password: 'pw-globex' });

    const chosen = await signIn({
      email: 'shared@x.mn',
      password: 'pw-initech',
      subdomain: 'initech',
    });

    expect(ambiguous.status).toBe(400);
    expect(((await ambiguous.json()) as { code: string }).code).toBe('ORGANIZATION_REQUIRED');
    expect(chosen.status).toBe(200);
  });

  it('blocks cookie-signed changes from other sites, not reads', async () => {
    const cookie = sessionCookie(
      await signIn({ email: 'owner@acme.mn', password: 'correct horse' }),
    );

    const crossSite = await fetch(`${base}/core/v1/users`, {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify({ email: 'evil@acme.mn' }),
    });

    const sameSite = await fetch(`${base}/core/v1/users`, {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify({ email: 'good@acme.mn' }),
    });

    const read = await fetch(`${base}/core/v1/users`, {
      headers: { cookie, 'sec-fetch-site': 'cross-site' },
    });

    expect(crossSite.status).toBe(403);
    expect(sameSite.status).toBe(201);
    expect(read.status).toBe(200);
  });

  it('refuses invited members (no password yet) and signs out', async () => {
    const invited = await signIn({ email: 'good@acme.mn', password: 'anything' });

    const out = await fetch(`${base}/core/v1/auth/sign-out`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    expect(invited.status).toBe(401);
    expect(out.headers.getSetCookie().join(';')).toMatch(/erxes_session=;/);
  });
});
