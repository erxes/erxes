import { users } from '@erxes/core-db';
import type { ORPCError } from '@orpc/client';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { hashPassword, sha256 } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { settle } from './settle';

import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
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

const LEGACY_PASSWORD = 'Legacy-pass-1';

const storedHash = async (email: string) => {
  const [row] = await adminDb()
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email));

  return row?.passwordHash;
};

/** In hours. */
const THIRTY_DAYS = 30 * 24;

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
    await settle();
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
    await settle();
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

  it.each([
    { format: 'argon2id', stored: () => hashPassword(LEGACY_PASSWORD), kept: true },
    // What core stored before argon2id: scrypt with N=16384, r=8, p=1.
    {
      format: 'scrypt',
      stored: async () =>
        'scrypt$16384$8$1$TeMdrIJLDPUw2xLyh9yiFA$eXxsgXrYwUQ_9GBp1Bpxeq_Tvc3K5eG1Y8UP7hLEGWavCOTIKvqW9koDP3dTZOWIDQ3Pccqht2Pl_p3S7t9Lkg',
      kept: false,
    },
    // Old erxes: bcrypt, cost 10, of the password's hex SHA-256.
    { format: 'bcrypt', stored: () => hash(sha256(LEGACY_PASSWORD), 10), kept: false },
  ])(
    'signs in with a $format hash, refuses a wrong password and leaves argon2id stored',
    async ({ format, stored, kept }) => {
      const email = `owner@${format}.mn`;
      const before = await stored();

      await createOrganization({
        subdomain: format,
        name: format,
        owner: { email, passwordHash: before },
      });

      expect(await failure(wrongPassword(email))).toMatchObject({ status: 401 });
      expect(await storedHash(email)).toBe(before);

      expect(
        await server.browser().api.auth.signIn({ email, password: LEGACY_PASSWORD }),
      ).toMatchObject({ user: { email } });

      const after = await storedHash(email);

      expect(after).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$[\w+/]{22}\$[\w+/]{43}$/);
      // A current hash is not rewritten.
      expect(after === before).toBe(kept);
      // The re-saved hash signs in too.
      expect(
        await failure(server.browser().api.auth.signIn({ email, password: LEGACY_PASSWORD })),
      ).toBeNull();
    },
  );

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
    const usersUrl = server.url('/core/v1/users');

    const invite = (site: string, email: string) =>
      fetch(usersUrl, {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': site },
        body: JSON.stringify({ email }),
      });

    expect((await invite('cross-site', 'evil@acme.mn')).status).toBe(403);
    expect((await invite('same-origin', 'good@acme.mn')).status).toBe(201);
    expect(
      (await fetch(usersUrl, { headers: { cookie, 'sec-fetch-site': 'cross-site' } })).status,
    ).toBe(200);
  });

  describe('a session in use', () => {
    const HOUR = 60 * 60 * 1000;
    let now = 0;

    beforeEach(() => {
      now = Date.now();
      vi.useFakeTimers({ toFake: ['Date'] });
    });

    afterEach(() => vi.useRealTimers());

    const at = (hours: number) => vi.setSystemTime(now + hours * HOUR);

    it('lasts 12 hours from the last request, not from the sign-in', async () => {
      const browser = await signedIn();
      const signedInWith = browser.cookie();

      at(11);
      await browser.api.auth.me();
      expect(browser.cookie()).not.toBe(signedInWith);

      // 20 hours after signing in, 9 after the last request: still signed in.
      at(20);
      expect(await failure(browser.api.auth.me())).toBeNull();

      // Then 13 hours away: signed out, the plugin's sessions with it.
      at(33);
      expect(await failure(browser.api.auth.me())).toMatchObject({ code: 'UNAUTHORIZED' });
      expect(await failure(browser.api.plugins.session({ name: 'hr' }))).toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('does not renew a fresh cookie', async () => {
      const browser = await signedIn();
      const signedInWith = browser.cookie();

      at(0.1);
      await browser.api.auth.me();
      expect(browser.cookie()).toBe(signedInWith);
    });

    it('ends 30 days after the sign-in, however active the member is', async () => {
      const browser = await signedIn();

      // A request every 11 hours keeps it going ...
      const steps = Array.from(
        { length: Math.floor(THIRTY_DAYS / 11) },
        (_, index) => (index + 1) * 11,
      );

      await inOrder(steps, async (hours) => {
        at(hours);
        expect(await failure(browser.api.auth.me())).toBeNull();
      });

      // ... until 30 days are up.
      at(THIRTY_DAYS + 0.1);
      expect(await failure(browser.api.auth.me())).toMatchObject({ code: 'UNAUTHORIZED' });
    });
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
