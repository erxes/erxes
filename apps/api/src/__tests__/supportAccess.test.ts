import { newId } from '@erxes/core-db';
import { exportJWK, generateKeyPair, type CryptoKey, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { useSaas } from './saasSupport';
import { useTwoOrgs } from './support';

const KID = 'erxes-io-2026';

/** Where core sends an admin it didn't let in. */
const refusedWith = (status: string) =>
  `https://erxes.io/support-access/result?subdomain=acme&status=${status}`;

interface LinkOptions {
  key?: CryptoKey;
  kid?: string;
  audience?: string;
  staff?: string;
  lifetime?: string;
}

describe('erxes support visits', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const saas = useSaas(t);
  let signingKey: CryptoKey;
  let strangerKey: CryptoKey;

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256', { extractable: true });
    const { x = '', y = '' } = await exportJWK(pair.publicKey);

    signingKey = pair.privateKey;
    strangerKey = (await generateKeyPair('ES256')).privateKey;
    saas.enable();
    config.saas.supportKeys = [{ kty: 'EC', crv: 'P-256', kid: KID, x, y }];
  });

  afterAll(() => {
    config.saas.supportKeys = [];
  });

  /** erxes.io's "Open as support" link, as global-profile signs it. */
  const link = ({ staff = 'staff01', ...options }: LinkOptions = {}) =>
    new SignJWT({
      typ: 'support_login',
      name: 'Bat Support',
      email: `${staff}@erxes.io`,
      reason: 'Fix the pipeline settings',
    })
      .setProtectedHeader({ alg: 'ES256', kid: options.kid ?? KID })
      .setIssuer('erxes-saas')
      .setAudience(options.audience ?? 'acme')
      .setSubject(staff)
      .setJti(newId())
      .setIssuedAt()
      .setExpirationTime(options.lifetime ?? '60s')
      .sign(options.key ?? signingKey);

  /** Follows the link into Acme: where it sends the admin, and their browser. */
  const open = async (token: string) => {
    const response = await fetch(t.url(`/core/v1/saas/support-login?token=${token}`), {
      redirect: 'manual',
      headers: { 'x-forwarded-host': 'acme.os.erxes.io' },
    });

    const cookie = response.headers
      .getSetCookie()
      .find((item) => item.startsWith('erxes_session='))
      ?.split(';')[0];

    return { location: response.headers.get('location'), support: t.browser(cookie).api };
  };

  it('signs the admin in as their own support member, an owner without team, role, key and audit settings', async () => {
    const { location, support } = await open(await link());

    expect(location).toBe('/');

    const session = await support.auth.me({});

    expect(session.user).toMatchObject({
      fullName: 'Bat Support (erxes support)',
      email: 'staff01+erxes-support@erxes.io',
      role: 'owner',
      isSupport: true,
    });
    expect(session.permissions).toEqual(
      expect.arrayContaining(['plugins.manage', 'contacts.delete']),
    );

    for (const denied of [
      'team.invite',
      'team.manage',
      'roles.manage',
      'api_keys.create',
      'support.manage',
      'assistant.manage',
      'webhooks.manage',
      'portals.manage',
    ]) {
      expect(session.permissions).not.toContain(denied);
    }

    // No password: the link is their only way in.
    await expect(
      support.auth.changePassword({ newPassword: 'Support-pass-123' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });
    // Nor an address of their own that would get mail after the visit.
    await expect(
      support.users.update({ id: session.user.id, email: 'me@elsewhere.test' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });
    await expect(
      support.users.update({ id: session.user.id, phone: '99112233' }),
    ).resolves.toMatchObject({ phone: '99112233' });

    await expect(support.audit.settings({})).resolves.toMatchObject({ retentionDays: 365 });
    await expect(support.supportAccess.settings({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
    await expect(support.users.invite({ email: 'mole@acme.mn' })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
    // Their own visit only, for the banner.
    expect((await support.supportAccess.active({})).data).toEqual([
      expect.objectContaining({ staffName: 'Bat Support', reason: 'Fix the pipeline settings' }),
    ]);
  });

  it('shows the owners every visit, tells them by notification, and keeps support off the team', async () => {
    const owner = t.owner();

    expect((await owner.supportAccess.active({})).data).toHaveLength(1);
    expect((await owner.supportAccess.visits({})).data).toEqual([
      expect.objectContaining({ staffEmail: 'staff01@erxes.io', endedAt: null, endedBy: null }),
    ]);
    expect((await owner.notifications.list({ kind: 'core.security.alert' })).data).toEqual([
      expect.objectContaining({ title: 'erxes support entered your workspace: Bat Support' }),
    ]);

    const team = await owner.users.list({});

    expect(team.data.map((user) => user.email)).not.toContain('staff01+erxes-support@erxes.io');
    // A member sees no visits; the setting is the owners'.
    expect((await t.member().supportAccess.active({})).data).toEqual([]);
    await expect(t.member().supportAccess.settings({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });

  it('refuses a spent, foreign, unknown-key, long-lived or wrong-workspace link', async () => {
    const token = await link({ staff: 'staff02' });

    expect((await open(token)).location).toBe('/');
    expect((await open(token)).location).toBe(refusedWith('invalid'));
    expect((await open(await link({ key: strangerKey }))).location).toBe(refusedWith('invalid'));
    expect((await open(await link({ kid: 'retired' }))).location).toBe(refusedWith('invalid'));
    expect((await open(await link({ lifetime: '10m' }))).location).toBe(refusedWith('invalid'));
    expect((await open(await link({ audience: 'globex' }))).location).toBe(refusedWith('invalid'));
  });

  it('ends a visit when an owner says so, and an earlier visit’s cookie never comes back', async () => {
    const first = await open(await link({ staff: 'staff03' }));

    const ended = await Promise.all(
      (await t.owner().supportAccess.active({})).data.map((item) =>
        t.owner().supportAccess.endVisit({ id: item.id }),
      ),
    );

    expect(ended.every((item) => item.endedBy === t.ids.owner)).toBe(true);
    await expect(first.support.auth.me({})).rejects.toMatchObject({ status: 401 });
    await expect(
      t.owner().supportAccess.endVisit({ id: ended[0]?.id ?? '' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    const second = await open(await link({ staff: 'staff03' }));

    await expect(second.support.auth.me({})).resolves.toMatchObject({ user: { isSupport: true } });
    await expect(first.support.auth.me({})).rejects.toMatchObject({ status: 401 });
  });

  it('keeps support out while an owner has support access off, and ends the visit in progress', async () => {
    const inside = await open(await link({ staff: 'staff04' }));

    expect(await t.owner().supportAccess.updateSettings({ enabled: false })).toEqual({
      enabled: false,
      available: true,
    });
    await expect(inside.support.auth.me({})).rejects.toMatchObject({ status: 401 });
    expect((await t.owner().supportAccess.active({})).data).toEqual([]);
    expect((await open(await link({ staff: 'staff04' }))).location).toBe(refusedWith('off'));

    await t.owner().supportAccess.updateSettings({ enabled: true });

    expect((await open(await link({ staff: 'staff04' }))).location).toBe('/');
  });

  it('keeps one support member for an admin erxes.io made again under the same email', async () => {
    const before = await open(await link({ staff: 'staff06' }));
    const { user } = await before.support.auth.me({});

    const again = await new SignJWT({
      typ: 'support_login',
      name: 'Bat Again',
      email: 'staff06@erxes.io',
      reason: 'Check the import',
    })
      .setProtectedHeader({ alg: 'ES256', kid: KID })
      .setIssuer('erxes-saas')
      .setAudience('acme')
      .setSubject('staff06b')
      .setJti(newId())
      .setIssuedAt()
      .setExpirationTime('60s')
      .sign(signingKey);

    const after = await open(again);

    expect((await after.support.auth.me({})).user).toMatchObject({
      id: user.id,
      fullName: 'Bat Again (erxes support)',
    });
  });

  it("never shows or ends another organisation's visits", async () => {
    const [visit] = (await t.owner().supportAccess.visits({})).data;

    expect(visit).toBeDefined();

    expect((await t.other().supportAccess.visits({})).data).toEqual([]);
    expect((await t.other().supportAccess.active({})).data).toEqual([]);
    await expect(t.other().supportAccess.endVisit({ id: visit?.id ?? '' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});
