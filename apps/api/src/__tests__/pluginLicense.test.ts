import { type CryptoKey, decodeJwt, exportJWK, generateKeyPair, type JWK, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { ERXES_LICENSE_KEYS } from '~/modules/license/keys';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const KID = 'erxes-license-2026';

const DAY = 24 * 60 * 60 * 1000;

describe('erxes license for plugins that need one (self-hosted)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let erxesKey: CryptoKey;
  let strangerKey: CryptoKey;
  // The tests' stand-in for erxes' key: they sign licenses with its private half.
  let testKeys: JWK[];

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256', { extractable: true });
    const { x = '', y = '' } = await exportJWK(pair.publicKey);

    erxesKey = pair.privateKey;
    strangerKey = (await generateKeyPair('ES256')).privateKey;
    testKeys = [{ kty: 'EC', crv: 'P-256', kid: KID, x, y }];
    config.license.keys = testKeys;
  });

  afterAll(() => {
    config.license.token = undefined;
    config.license.keys = ERXES_LICENSE_KEYS;
  });

  /** A license as erxes.io signs one: for these plugins, ending `until`. */
  const license = (plugins: string[], until: Date, key = erxesKey) =>
    new SignJWT({ plugins, until: until.toISOString() })
      .setProtectedHeader({ alg: 'ES256', kid: KID, typ: 'erxes-license+jwt' })
      .setIssuer('erxes')
      .setSubject('acme-llc')
      .setIssuedAt()
      .sign(key);

  const useLicense = async (plugins: string[], until: Date, key?: CryptoKey) => {
    config.license.token = await license(plugins, until, key);
  };

  const register = async (requiresLicense?: boolean) =>
    t
      .client(await t.pluginToken())
      .plugins.registerManifest({ title: 'HR', version: '9', requiresLicense });

  /** What the member's token for the plugin says it may do. */
  const accessNow = async () =>
    decodeJwt((await t.member().plugins.session({ name: 'hr' })).token).access;

  it('keeps it off until the license names it, and says so when it registers', async () => {
    config.license.token = undefined;

    await expect(register(true)).resolves.toMatchObject({
      warnings: [expect.stringContaining('needs an erxes license')],
    });
    const refused = t.member().plugins.session({ name: 'hr' });

    await expect(refused).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
    await expect(refused).rejects.toThrow('needs an erxes license for this server');

    await useLicense(['hr'], new Date(Date.now() + 365 * DAY));

    await expect(register(true)).resolves.toMatchObject({ warnings: [] });
    await expect(accessNow()).resolves.toBe('full');

    await useLicense(['ecom'], new Date(Date.now() + 365 * DAY));
    await expect(accessNow()).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });

    // A license erxes.io didn't sign counts as none.
    await useLicense(['hr'], new Date(Date.now() + 365 * DAY), strangerKey);
    await expect(accessNow()).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
  });

  it('lets it read for the grace days after the license ends, then stops it', async () => {
    await register(true);

    await useLicense(['hr'], new Date(Date.now() - DAY));
    await expect(accessNow()).resolves.toBe('read_only');
    await expect(register(true)).resolves.toMatchObject({
      warnings: [expect.stringContaining('has ended')],
    });

    await useLicense(['hr'], new Date(Date.now() - 30 * DAY));
    await expect(accessNow()).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
  });

  it.each(['core', 'sales'])(
    'tells members a licensed plugin is %s’s edition, so web lists its apps with that one’s',
    async (extended) => {
      await t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '9',
        requiresLicense: true,
        extends: extended,
      });

      const hr = (await t.member().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

      expect(hr?.manifest?.extends).toBe(extended);
    },
  );

  it('trusts only the keys built into core, so a license a server signs itself is refused', async () => {
    config.license.keys = ERXES_LICENSE_KEYS;

    try {
      // Signed with a key of the server's own, under the id of erxes' key.
      await useLicense(['hr'], new Date(Date.now() + 365 * DAY));

      await expect(register(true)).resolves.toMatchObject({
        warnings: [expect.stringContaining('needs an erxes license')],
      });
      await expect(accessNow()).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
    } finally {
      config.license.keys = testKeys;
    }
  });

  it('never stops a plugin that does not ask for a license', async () => {
    config.license.token = undefined;

    await register();

    await expect(accessNow()).resolves.toBe('full');
  });
});
