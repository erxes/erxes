import type { ORPCError } from '@orpc/client';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/modules/auth/password';
import { processJobs } from '~/modules/jobs/jobs';
import { JOBS } from '~/modules/jobs/registry';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase } from './db';
import { useTestServer } from './support';

/** How a call failed, or null when it didn't. */
const failure = (call: Promise<unknown>) =>
  call.then(
    () => null,
    (error: ORPCError<string, unknown>) => ({
      status: error.status,
      code: error.code,
      message: error.message,
    }),
  );

const OWNER = { email: 'owner@acme.mn', password: 'correct horse' };

describe('sign-in (/core/v1/auth)', () => {
  useTestDatabase();

  const server = useTestServer();

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: OWNER.email, passwordHash: await hashPassword(OWNER.password) },
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
  });

  /** A browser signed in as `credentials`. */
  const signedIn = async (credentials = OWNER) => {
    const browser = server.browser();

    await browser.api.auth.signIn(credentials);

    return browser;
  };

  it('signs in, sets an HttpOnly session cookie and answers /me with it', async () => {
    const response = await fetch(server.url('/core/v1/auth/sign-in'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'OWNER@acme.mn', password: OWNER.password }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().join(';')).toMatch(
      /erxes_session=.*HttpOnly.*SameSite=Lax/i,
    );

    const browser = server.browser();

    expect(
      await browser.api.auth.signIn({ email: 'OWNER@acme.mn', password: OWNER.password }),
    ).toMatchObject({
      user: { email: 'owner@acme.mn', role: 'owner' },
      organization: { subdomain: 'acme' },
    });
    expect((await browser.api.auth.me({})).user.email).toBe('owner@acme.mn');
  });

  it('remembers the welcome steps on the member, not the browser', async () => {
    const { api } = await signedIn();

    expect((await api.auth.me({})).user.onboardedAt).toBeNull();

    const done = await api.auth.onboarded({});

    expect(done.user.onboardedAt).toEqual(expect.any(String));
    // Again: the first time is kept.
    expect((await api.auth.onboarded({})).user.onboardedAt).toBe(done.user.onboardedAt);
  });

  it('fills a fresh organisation with example data once, for its owner', async () => {
    const umbrella = { email: 'owner@umbrella.mn', password: 'pw-umbrella' };

    await createOrganization({
      subdomain: 'umbrella',
      name: 'Umbrella',
      owner: { email: umbrella.email, passwordHash: await hashPassword(umbrella.password) },
    });

    const { api } = await signedIn(umbrella);

    const customersIn = async (state: 'customer' | 'lead') =>
      (await api.customers.list({ state })).totalCount;

    await api.auth.onboarded({ exampleData: true, language: 'mn' });
    // Seeded by a job, right after.
    await processJobs(JOBS);
    expect(await customersIn('customer')).toBe(5);
    expect(await customersIn('lead')).toBe(5);
    expect((await api.companies.list({})).data.map((company) => company.primaryName)).toContain(
      'Хангай Трейд ХХК',
    );
    expect(
      (await api.views.list({ recordType: 'customer' })).data.map((view) => view.name),
    ).toEqual(['VIP харилцагчид']);
    expect((await api.automations.list({})).data).toHaveLength(1);

    // Again (another browser, a second click): nothing more.
    await (await signedIn(umbrella)).api.auth.onboarded({ exampleData: true, language: 'mn' });
    await processJobs(JOBS);
    expect(await customersIn('customer')).toBe(5);
    expect((await api.companies.list({})).totalCount).toBe(4);
  }, 600_000);

  const wrongPassword = (email: string) =>
    server.browser().api.auth.signIn({ email, password: 'nope' });

  it('answers wrong password and unknown email the same way', async () => {
    const wrong = await failure(wrongPassword(OWNER.email));

    expect(wrong).toMatchObject({ status: 401 });
    expect(await failure(wrongPassword('nobody@acme.mn'))).toEqual(wrong);
  });

  it('asks for the organisation when the email exists in several', async () => {
    await expect(
      server.browser().api.auth.signIn({ email: 'shared@x.mn', password: 'pw-globex' }),
    ).rejects.toMatchObject({ status: 400, code: 'ORGANIZATION_REQUIRED' });

    const chosen = await server
      .browser()
      .api.auth.signIn({ email: 'shared@x.mn', password: 'pw-initech', subdomain: 'initech' });

    expect(chosen).toMatchObject({ organization: { subdomain: 'initech' } });
  });

  it('blocks cookie-signed changes from other sites, not reads', async () => {
    const cookie = (await signedIn()).cookie();
    const users = server.url('/core/v1/users');

    const invite = (site: string, email: string) =>
      fetch(users, {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': site },
        body: JSON.stringify({ email }),
      });

    expect((await invite('cross-site', 'evil@acme.mn')).status).toBe(403);
    expect((await invite('same-origin', 'good@acme.mn')).status).toBe(201);
    expect(
      (await fetch(users, { headers: { cookie, 'sec-fetch-site': 'cross-site' } })).status,
    ).toBe(200);
  });

  it('refuses invited members (no password yet) and signs out', async () => {
    await expect(
      server.browser().api.auth.signIn({ email: 'good@acme.mn', password: 'anything' }),
    ).rejects.toMatchObject({ status: 401 });

    const browser = await signedIn();

    await browser.api.auth.signOut({});
    expect(browser.cookie()).toBe('erxes_session=');
  });
});
