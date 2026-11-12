import { createHash, randomBytes } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describeWithDb('Sign in with erxes (OAuth 2.1 / OpenID Connect)', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let session = '';
  const redirect = 'https://acme.hr.example.com/callback';

  const pkce = () => {
    const verifier = randomBytes(32).toString('base64url');

    return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
  };

  const authorize = async (params: Record<string, string>, cookie = session) => {
    const url = new URL(`${base}/core/v1/oauth/authorize`);

    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    return fetch(url, { redirect: 'manual', headers: cookie ? { cookie } : {} });
  };

  const token = async (body: Record<string, string>) => {
    const response = await fetch(`${base}/core/v1/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });

    return { status: response.status, body: (await response.json()) as Record<string, string> };
  };

  const codeFor = async (challenge: string, scope = 'openid profile email offline_access') => {
    const response = await authorize({
      response_type: 'code',
      client_id: 'hr',
      redirect_uri: redirect,
      state: 'xyz',
      scope,
      nonce: 'n-1',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const location = new URL(response.headers.get('location')!);

    return { location, code: location.searchParams.get('code')! };
  };

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: {
        email: 'o@acme.mn',
        passwordHash: await hashPassword('Owner-pass-1'),
        fullName: 'Owner Bat',
      },
    });
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    await fetch(`${base}/core/v1/plugins/manifest`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${await pluginToken(base)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'HR',
        version: '1',
        oauth: { redirectUris: ['https://{subdomain}.hr.example.com/callback'] },
        permissions: [{ action: 'hr.leave.approve', label: 'Approve leave' }],
      }),
    });

    const signedIn = await fetch(`${base}/core/v1/auth/sign-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'o@acme.mn', password: 'Owner-pass-1' }),
    });

    session = (
      signedIn.headers.getSetCookie().find((c) => c.startsWith('erxes_session=')) ?? ''
    ).split(';')[0]!;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('signs a member into a plugin app with a code, PKCE, and tokens anyone can verify', async () => {
    // Not signed in: to erxes sign-in first, then back.
    const anonymous = await authorize({ client_id: 'hr', redirect_uri: redirect }, '');

    expect(anonymous.status).toBe(302);
    expect(anonymous.headers.get('location')).toMatch(/^\/\?next=%2Fcore%2Fv1%2Foauth%2Fauthorize/);

    // An address the app didn't register is never redirected to.
    expect(
      (
        await authorize({
          client_id: 'hr',
          redirect_uri: 'https://evil.example.com/cb',
          response_type: 'code',
        })
      ).status,
    ).toBe(400);

    const { verifier, challenge } = pkce();
    const { location, code } = await codeFor(challenge);

    expect(location.origin + location.pathname).toBe(redirect);
    expect(location.searchParams.get('state')).toBe('xyz');

    expect(
      (
        await token({
          grant_type: 'authorization_code',
          client_id: 'hr',
          code,
          redirect_uri: redirect,
          code_verifier: 'wrong',
        })
      ).body.error,
    ).toBe('invalid_grant');

    const issued = await token({
      grant_type: 'authorization_code',
      client_id: 'hr',
      code,
      redirect_uri: redirect,
      code_verifier: verifier,
    });

    expect(issued.status).toBe(200);
    expect(issued.body).toMatchObject({ token_type: 'Bearer', expires_in: 3600 });

    // A code works once.
    expect(
      (
        await token({
          grant_type: 'authorization_code',
          client_id: 'hr',
          code,
          redirect_uri: redirect,
          code_verifier: verifier,
        })
      ).status,
    ).toBe(400);

    const discovery = await fetch(`${base}/core/v1/.well-known/openid-configuration`).then(
      (r) => r.json() as Promise<{ jwks_uri: string }>,
    );

    const jwks = createLocalJWKSet(
      (await fetch(discovery.jwks_uri).then((r) => r.json())) as Parameters<
        typeof createLocalJWKSet
      >[0],
    );

    const { payload: id } = await jwtVerify(issued.body.id_token!, jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
    });

    expect(id).toMatchObject({
      email: 'o@acme.mn',
      name: 'Owner Bat',
      nonce: 'n-1',
      organization: 'acme',
    });

    const { payload: access } = await jwtVerify(issued.body.access_token!, jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
      typ: 'at+jwt',
    });

    expect(access).toMatchObject({ role: 'owner', permissions: ['hr.leave.approve'] });

    const userinfo = await fetch(`${base}/core/v1/oauth/userinfo`, {
      headers: { authorization: `Bearer ${issued.body.access_token}` },
    });

    expect(await userinfo.json()).toMatchObject({ email: 'o@acme.mn', organization: 'acme' });
  });

  it('rotates refresh tokens, revokes the family when one is reused, and ends with sign out everywhere', async () => {
    const { verifier, challenge } = pkce();
    const { code } = await codeFor(challenge);

    const first = await token({
      grant_type: 'authorization_code',
      client_id: 'hr',
      code,
      redirect_uri: redirect,
      code_verifier: verifier,
    });

    const second = await token({
      grant_type: 'refresh_token',
      client_id: 'hr',
      refresh_token: first.body.refresh_token!,
    });

    expect(second.status).toBe(200);
    expect(second.body.refresh_token).not.toBe(first.body.refresh_token);

    // The first one again: stolen. Everything from that sign-in stops.
    expect(
      (
        await token({
          grant_type: 'refresh_token',
          client_id: 'hr',
          refresh_token: first.body.refresh_token!,
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await token({
          grant_type: 'refresh_token',
          client_id: 'hr',
          refresh_token: second.body.refresh_token!,
        })
      ).status,
    ).toBe(400);

    // A new sign-in, then "sign out everywhere" in erxes.
    const again = pkce();

    const fresh = await token({
      grant_type: 'authorization_code',
      client_id: 'hr',
      code: (await codeFor(again.challenge)).code,
      redirect_uri: redirect,
      code_verifier: again.verifier,
    });

    await fetch(`${base}/core/v1/auth/sign-out-everywhere`, {
      method: 'POST',
      headers: { cookie: session, origin: base },
    });
    expect(
      (
        await token({
          grant_type: 'refresh_token',
          client_id: 'hr',
          refresh_token: fresh.body.refresh_token!,
        })
      ).status,
    ).toBe(400);
  });
});
