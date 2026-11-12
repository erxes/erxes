import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { hashPassword } from '~/modules/auth/password';
import { codeAt, currentStep } from '~/modules/auth/totp';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('two-factor sign-in', { timeout: 240_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';

  const call = async (cookie: string | null, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { ...(cookie ? { cookie } : {}), 'content-type': 'application/json', origin: base },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return {
      status: response.status,
      body: text ? JSON.parse(text) : null,
      cookie:
        (response.headers.getSetCookie().find((c) => c.startsWith('erxes_session=')) ?? '').split(
          ';',
        )[0] ||
        cookie ||
        '',
    };
  };

  const signIn = () =>
    call(null, 'POST', '/auth/sign-in', { email: 'o@acme.mn', password: 'Owner-pass-1' });

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn', passwordHash: await hashPassword('Owner-pass-1') },
    });
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('turns on with a code from the app, then asks for one at every sign-in — each code once', async () => {
    let session = (await signIn()).cookie;
    const setup = await call(session, 'POST', '/auth/2fa/setup');

    expect(setup.body.uri).toMatch(/^otpauth:\/\/totp\/erxes%3Ao%40acme\.mn\?secret=/);
    expect((await call(session, 'POST', '/auth/2fa/enable', { code: '000000' })).body.code).toBe(
      'WRONG_CODE',
    );

    const enabled = await call(session, 'POST', '/auth/2fa/enable', {
      code: codeAt(setup.body.secret, currentStep()),
    });

    expect(enabled.body.recoveryCodes).toHaveLength(10);
    session = enabled.cookie;
    expect((await call(session, 'GET', '/auth/me')).body.user.twoFactorEnabled).toBe(true);

    // The password alone no longer signs in.
    const first = await signIn();

    expect(first.body).toMatchObject({ twoFactorRequired: true });
    expect(first.cookie).toBe('');
    expect(
      (
        await call(null, 'POST', '/auth/sign-in/2fa', {
          challenge: first.body.challenge,
          code: '123456',
        })
      ).body.code,
    ).toBe('WRONG_CODE');

    // The code from the step after the one used to enable works, once.
    const code = codeAt(setup.body.secret, currentStep() + 1);

    const done = await call(null, 'POST', '/auth/sign-in/2fa', {
      challenge: first.body.challenge,
      code,
    });

    expect(done.status).toBe(200);
    expect(done.cookie).toMatch(/^erxes_session=/);

    const replay = await call(null, 'POST', '/auth/sign-in/2fa', {
      challenge: (await signIn()).body.challenge,
      code,
    });

    expect(replay.body.code).toBe('WRONG_CODE');

    // A recovery code works once.
    const [recovery] = enabled.body.recoveryCodes as string[];

    const viaRecovery = await call(null, 'POST', '/auth/sign-in/2fa', {
      challenge: (await signIn()).body.challenge,
      recoveryCode: recovery,
    });

    expect(viaRecovery.status).toBe(200);
    expect(
      (
        await call(null, 'POST', '/auth/sign-in/2fa', {
          challenge: (await signIn()).body.challenge,
          recoveryCode: recovery,
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await call(null, 'POST', '/auth/sign-in/2fa', {
          challenge: 'not-a-real-challenge',
          code: '123456',
        })
      ).body.code,
    ).toBe('CHALLENGE_EXPIRED');

    // Turning it off needs the password.
    expect(
      (await call(viaRecovery.cookie, 'POST', '/auth/2fa/disable', { password: 'nope' })).body.code,
    ).toBe('WRONG_PASSWORD');
    expect(
      (await call(viaRecovery.cookie, 'POST', '/auth/2fa/disable', { password: 'Owner-pass-1' }))
        .status,
    ).toBe(200);
    expect((await signIn()).body.user).toMatchObject({ twoFactorEnabled: false });
  });
});
