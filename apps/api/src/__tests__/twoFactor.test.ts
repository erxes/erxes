import { rateLimits, secrets } from '@erxes/core-db';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { codeAt, currentStep } from '~/modules/auth/totp';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { useTestServer } from './support';

describe('two-factor sign-in', { timeout: 240_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const credentials = { email: 'o@acme.mn', password: 'Owner-pass-1' };

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: credentials.email, passwordHash: await hashPassword(credentials.password) },
    });
  });

  /** Signs in with the password in a fresh browser; returns the 2FA challenge it is given. */
  const challenge = async () => {
    const answer = await server.browser().api.auth.signIn(credentials);

    if (!('challenge' in answer)) throw new Error('signed in without a second factor');

    return answer.challenge;
  };

  it('turns on with a code from the app, then asks for one at every sign-in, each code once', async () => {
    const owner = server.browser();

    await owner.api.auth.signIn(credentials);

    const setup = await owner.api.auth.twoFactorSetup({});

    expect(setup.uri).toMatch(/^otpauth:\/\/totp\/erxes%3Ao%40acme\.mn\?secret=/);

    const pending = await adminDb().select().from(secrets);

    expect(pending).toHaveLength(1);
    expect(JSON.stringify(pending)).not.toContain(setup.secret);
    await expect(owner.api.auth.twoFactorEnable({ code: '000000' })).rejects.toMatchObject({
      code: 'WRONG_CODE',
    });

    const enabled = await owner.api.auth.twoFactorEnable({
      code: codeAt(setup.secret, currentStep()),
    });

    expect(enabled.recoveryCodes).toHaveLength(10);
    expect((await adminDb().select().from(secrets)).map((row) => row.id)).toEqual([pending[0]?.id]);
    expect((await owner.api.auth.me({})).user.totpEnabledAt).not.toBeNull();

    // The password alone no longer signs in, and no session is set.
    const first = server.browser();

    expect(await first.api.auth.signIn(credentials)).toMatchObject({ twoFactorRequired: true });
    expect(first.cookie()).toBe('');
    await expect(
      first.api.auth.signInTwoFactor({ challenge: await challenge(), code: '123456' }),
    ).rejects.toMatchObject({ code: 'WRONG_CODE' });

    // The code from the step after the one used to enable works, once.
    const code = codeAt(setup.secret, currentStep() + 1);
    const done = server.browser();

    await done.api.auth.signInTwoFactor({ challenge: await challenge(), code });
    expect(done.cookie()).toMatch(/^erxes_session=./);
    await expect(
      server.browser().api.auth.signInTwoFactor({ challenge: await challenge(), code }),
    ).rejects.toMatchObject({ code: 'WRONG_CODE' });

    // A recovery code works once.
    const [recoveryCode] = enabled.recoveryCodes;
    const recovered = server.browser();

    await recovered.api.auth.signInTwoFactor({ challenge: await challenge(), recoveryCode });
    await expect(
      server.browser().api.auth.signInTwoFactor({ challenge: await challenge(), recoveryCode }),
    ).rejects.toMatchObject({ code: 'WRONG_CODE' });
    await expect(
      server
        .browser()
        .api.auth.signInTwoFactor({ challenge: 'not-a-real-challenge', code: '123456' }),
    ).rejects.toMatchObject({ code: 'CHALLENGE_EXPIRED' });

    // Turning it off needs the password.
    await expect(recovered.api.auth.twoFactorDisable({ password: 'nope' })).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
    await recovered.api.auth.twoFactorDisable({ password: credentials.password });
    expect(await adminDb().select().from(secrets)).toEqual([]);
    expect(await server.browser().api.auth.signIn(credentials)).toMatchObject({
      user: { totpEnabledAt: null },
    });
  });

  it('locks the account after 10 wrong second steps, even on one challenge', async () => {
    const globex = { email: 'o@globex.mn', password: 'Owner-pass-1', subdomain: 'globex' };

    await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: globex.email, passwordHash: await hashPassword(globex.password) },
    });

    const owner = server.browser();

    await owner.api.auth.signIn(globex);

    const { secret } = await owner.api.auth.twoFactorSetup({});

    await owner.api.auth.twoFactorEnable({ code: codeAt(secret, currentStep()) });

    const answer = await server.browser().api.auth.signIn(globex);

    if (!('challenge' in answer)) throw new Error('signed in without a second factor');

    const guess = (body: { code?: string; recoveryCode?: string }) =>
      server.browser().api.auth.signInTwoFactor({ challenge: answer.challenge, ...body });

    // A fresh minute for the per-address limit, so the account lockout is what answers.
    await adminDb().delete(rateLimits);

    // Wrong recovery codes count as much as wrong authenticator codes.
    await expect(guess({ recoveryCode: 'aaaaa-aaaaa' })).rejects.toMatchObject({
      code: 'WRONG_CODE',
    });

    // Nine wrong codes on the same challenge (a match is one in a million per guess).
    await inOrder(
      ['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888'],
      (code) => expect(guess({ code })).rejects.toMatchObject({ code: 'WRONG_CODE' }),
    );

    await expect(guess({ code: codeAt(secret, currentStep() + 1) })).rejects.toMatchObject({
      code: 'TOO_MANY_ATTEMPTS',
    });
  });
});
