import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';

describeWithDb('invitations and password resets by email', { timeout: 240_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let owner = '';

  const call = async (token: string | null, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return {
      status: response.status,
      body: text ? JSON.parse(text) : null,
      cookie:
        (response.headers.getSetCookie().find((c) => c.startsWith('erxes_session=')) ?? '').split(
          ';',
        )[0] ?? '',
    };
  };

  const send = async () => {
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { JOBS } = await import('~/modules/jobs/registry');

    await processJobs(JOBS);
  };

  const lastEmail = async (to: string) => {
    const { loggedEmails } = await import('~/modules/email/email');

    return [...loggedEmails].reverse().find((email) => email.to === to);
  };

  const tokenIn = (text: string, path: string) =>
    decodeURIComponent(new RegExp(`${path}\\?token=([^\\s]+)`).exec(text)![1]!);

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: {
        email: 'owner@acme.mn',
        passwordHash: await hashPassword('Owner-pass-1'),
        fullName: 'Owner Bat',
      },
    });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('emails an invitation; the link shows who invited, sets a password once and signs in', async () => {
    const invited = await call(owner, 'POST', '/users', { email: 'new@acme.mn' });

    expect(invited.body.status).toBe('invited');
    await send();

    const email = await lastEmail('new@acme.mn');

    expect(email?.subject).toBe('Owner Bat invited you to Acme on erxes');

    const token = tokenIn(email!.text, '/accept-invitation');

    expect(
      (await call(null, 'GET', `/auth/invitation?token=${encodeURIComponent(token)}`)).body,
    ).toEqual({
      organization: 'Acme',
      email: 'new@acme.mn',
      inviter: 'Owner Bat',
    });

    const accepted = await call(null, 'POST', '/auth/invitation/accept', {
      token,
      password: 'New-member-1',
      firstName: 'Saraa',
    });

    expect(accepted.status).toBe(200);
    expect(accepted.body.user).toMatchObject({
      email: 'new@acme.mn',
      status: 'active',
      firstName: 'Saraa',
    });
    expect(accepted.cookie).toMatch(/^erxes_session=/);

    // Once only.
    expect(
      (await call(null, 'POST', '/auth/invitation/accept', { token, password: 'New-member-2' }))
        .body.code,
    ).toBe('INVALID_LINK');

    // A resent invitation replaces the earlier link.
    const second = await call(owner, 'POST', '/users', { email: 'second@acme.mn' });

    await send();

    const first = tokenIn((await lastEmail('second@acme.mn'))!.text, '/accept-invitation');

    expect((await call(owner, 'POST', `/users/${second.body.id}/invitation`)).status).toBe(200);
    await send();
    expect(
      (await call(null, 'GET', `/auth/invitation?token=${encodeURIComponent(first)}`)).body.code,
    ).toBe('INVALID_LINK');
  });

  it('resets a password by email without telling whether the email exists, and ends old sessions', async () => {
    const before = await call(null, 'POST', '/auth/sign-in', {
      email: 'owner@acme.mn',
      password: 'Owner-pass-1',
    });

    expect(
      (await call(null, 'POST', '/auth/password-reset', { email: 'nobody@acme.mn' })).body,
    ).toEqual({ ok: true });
    expect(
      (await call(null, 'POST', '/auth/password-reset', { email: 'OWNER@acme.mn' })).body,
    ).toEqual({ ok: true });
    await send();
    expect(await lastEmail('nobody@acme.mn')).toBeUndefined();

    const token = tokenIn((await lastEmail('owner@acme.mn'))!.text, '/reset-password');

    expect(
      (await call(null, 'POST', '/auth/password-reset/confirm', { token, password: 'weak' }))
        .status,
    ).toBe(400);

    const reset = await call(null, 'POST', '/auth/password-reset/confirm', {
      token,
      password: 'Owner-pass-2',
    });

    expect(reset.status).toBe(200);
    expect(reset.cookie).toMatch(/^erxes_session=/);

    // The old session ended; the old password no longer works; the link is used up.
    const me = await fetch(`${base}/core/v1/auth/me`, { headers: { cookie: before.cookie } });

    expect(me.status).toBe(401);
    expect(
      (
        await call(null, 'POST', '/auth/sign-in', {
          email: 'owner@acme.mn',
          password: 'Owner-pass-1',
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await call(null, 'POST', '/auth/sign-in', {
          email: 'owner@acme.mn',
          password: 'Owner-pass-2',
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(null, 'POST', '/auth/password-reset/confirm', {
          token,
          password: 'Owner-pass-3',
        })
      ).body.code,
    ).toBe('INVALID_LINK');
    expect(
      (
        await call(null, 'POST', '/auth/password-reset/confirm', {
          token: 'madeupid12.madeupsecret',
          password: 'Owner-pass-3',
        })
      ).body.code,
    ).toBe('INVALID_LINK');
  });
});
