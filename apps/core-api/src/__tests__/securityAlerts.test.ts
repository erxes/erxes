import { newId, users } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/lib/crypto';
import { loggedEmails } from '~/modules/email/email';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const MEMBER = { email: 'm@acme.mn', password: 'Member-pass-1' };
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605 Safari/605';
const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/130.0 Safari/537';

const emailed = (to: string, subject: string) =>
  loggedEmails.some((email) => email.to === to && email.subject.includes(subject));

describe('security alerts', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = { secondOwner: newId(), member: newId() };

  beforeAll(async () => {
    await adminDb()
      .insert(users)
      .values([
        {
          id: ids.secondOwner,
          orgId: t.ids.org,
          email: 'o2@acme.mn',
          role: 'owner',
          status: 'active',
        },
        {
          id: ids.member,
          orgId: t.ids.org,
          email: MEMBER.email,
          role: 'member',
          status: 'active',
          passwordHash: await hashPassword(MEMBER.password),
        },
      ]);
  });

  /** The security notifications in a member's inbox: kind and title. */
  const alertsFor = async (user: string) =>
    (
      await t.client({ user, org: t.ids.org }).notifications.list({ kind: 'core.security.' })
    ).data.map((notification) => ({ kind: notification.kind, title: notification.title }));

  /** Signs in (or tries to) from a browser with this user agent and address. */
  const signIn = (password: string, agent = MAC, ip = '198.51.100.1') =>
    fetch(t.url('/core/v1/auth/sign-in'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': agent, 'x-forwarded-for': ip },
      body: JSON.stringify({ email: MEMBER.email, password }),
    });

  it('tells the other owners when an admin is made, in erxes and by email', async () => {
    await t.owner().users.update({ id: ids.member, role: 'admin' });
    expect(await alertsFor(ids.secondOwner)).toEqual([
      { kind: 'core.security.alert', title: 'm@acme.mn is now an admin' },
    ]);
    await settle();
    expect(emailed('o2@acme.mn', 'm@acme.mn is now an admin')).toBe(true);
  });

  it('tells owners about someone guessing a password (the alert line is 3 in tests)', async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) await signIn('wrong');

    expect((await alertsFor(ids.secondOwner)).map((alert) => alert.title)).toContain(
      '3 failed sign-ins to m@acme.mn in 15 minutes',
    );
  });

  it('tells a member about a sign-in from a new device and address; a known device is not news', async () => {
    expect((await signIn(MEMBER.password)).status).toBe(200);
    expect((await signIn(MEMBER.password)).status).toBe(200);
    expect(await alertsFor(ids.member)).toEqual([]);
    expect((await signIn(MEMBER.password, WINDOWS, '203.0.113.9')).status).toBe(200);
    expect(await alertsFor(ids.member)).toEqual([
      {
        kind: 'core.security.new_sign_in',
        title: 'New sign-in to your account from Chrome on Windows',
      },
    ]);
    expect((await signIn(MEMBER.password, WINDOWS, '203.0.113.77')).status).toBe(200);
    expect(await alertsFor(ids.member)).toHaveLength(1);

    await settle();
    expect(emailed(MEMBER.email, 'New sign-in')).toBe(true);
  });
});
