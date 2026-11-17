import { auditLogs, oauthCodes, oauthRefreshTokens, users } from '@erxes/core-db';
import { verifyErxesAccessToken } from '@erxes/plugin-sdk';
import { eq } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { hashPassword, randomToken, sha256 } from '~/lib/crypto';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { useTestServer } from './support';

const REDIRECT = 'https://acme.hr.example.com/callback';
const OWNER = { email: 'o@acme.mn', password: 'Owner-pass-1' };

/** What /oauth/token answers: tokens, or an OAuth error. */
const TokenAnswer = z.union([
  z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    refresh_token: z.string().optional(),
    id_token: z.string().optional(),
  }),
  z.object({ error: z.string() }),
]);

const Discovery = z.object({ jwks_uri: z.string() });

const pkce = () => {
  const verifier = randomToken(32);

  return { verifier, challenge: sha256(verifier, 'base64url') };
};

/** The token request for an authorization code. */
const exchange = (code: string, verifier: string) => ({
  grant_type: 'authorization_code',
  client_id: 'hr',
  code,
  redirect_uri: REDIRECT,
  code_verifier: verifier,
});

/** The id half of a code or refresh token (`<id>.<secret>`). */
const idOf = (credential = '') => credential.split('.')[0] ?? '';

const refused = { error: 'invalid_grant' };

const refresh = (refreshToken = '') => ({
  grant_type: 'refresh_token',
  client_id: 'hr',
  refresh_token: refreshToken,
});

describe('Sign in with erxes (OAuth 2.1 / OpenID Connect)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const owner = server.browser();

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: {
        email: OWNER.email,
        passwordHash: await hashPassword(OWNER.password),
        fullName: 'Owner Bat',
      },
    });
    await server.client(await server.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      oauth: { redirectUris: ['https://{subdomain}.hr.example.com/callback'] },
      permissions: [{ action: 'hr.leave.approve', label: 'Approve leave' }],
    });
    await owner.api.auth.signIn(OWNER);
  });

  /** GET /oauth/authorize in a browser holding `cookie`, without following the redirect. */
  const authorize = (params: Record<string, string>, cookie = owner.cookie()) => {
    const url = new URL(server.url('/core/v1/oauth/authorize'));

    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    return fetch(url, { redirect: 'manual', headers: cookie ? { cookie } : {} });
  };

  const token = async (body: Record<string, string>) => {
    const response = await fetch(server.url('/core/v1/oauth/token'), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });

    return { status: response.status, body: TokenAnswer.parse(await response.json()) };
  };

  /** Tokens for a grant that must succeed. */
  const granted = async (body: Record<string, string>) => {
    const answer = await token(body);

    if ('error' in answer.body) throw new Error(`token refused: ${answer.body.error}`);

    return answer.body;
  };

  const codeFor = async (challenge: string) => {
    const response = await authorize({
      response_type: 'code',
      client_id: 'hr',
      redirect_uri: REDIRECT,
      state: 'xyz',
      scope: 'openid profile email offline_access',
      nonce: 'n-1',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const location = new URL(response.headers.get('location') ?? '', server.url('/'));

    return { location, code: location.searchParams.get('code') ?? '' };
  };

  it('signs a member into a plugin app with a code, PKCE, and tokens anyone can verify', async () => {
    // Not signed in: to erxes sign-in first, then back.
    const anonymous = await authorize({ client_id: 'hr', redirect_uri: REDIRECT }, '');

    expect(anonymous.status).toBe(302);
    expect(anonymous.headers.get('location')).toMatch(/^\/\?next=%2Fcore%2Fv1%2Foauth%2Fauthorize/);

    // An address the app didn't register is never redirected to.
    const evil = await authorize({
      client_id: 'hr',
      redirect_uri: 'https://evil.example.com/cb',
      response_type: 'code',
    });

    expect(evil.status).toBe(400);

    const { verifier, challenge } = pkce();
    const { location, code } = await codeFor(challenge);

    expect(location.origin + location.pathname).toBe(REDIRECT);
    expect(location.searchParams.get('state')).toBe('xyz');
    expect((await token(exchange(code, 'wrong'))).body).toEqual({ error: 'invalid_grant' });

    const issued = await granted(exchange(code, verifier));

    expect(issued).toMatchObject({ token_type: 'Bearer', expires_in: 3600 });
    // A code works once.
    expect((await token(exchange(code, verifier))).status).toBe(400);

    const discovery = Discovery.parse(
      await (await fetch(server.url('/core/v1/.well-known/openid-configuration'))).json(),
    );

    const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));

    const { payload: id } = await jwtVerify(issued.id_token ?? '', jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
    });

    expect(id).toMatchObject({
      email: OWNER.email,
      name: 'Owner Bat',
      nonce: 'n-1',
      organization: 'acme',
    });

    const { payload: access } = await jwtVerify(issued.access_token, jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
      typ: 'at+jwt',
    });

    expect(access).toMatchObject({ role: 'owner', permissions: ['hr.leave.approve'] });
    // The SDK reads the claims core signs; the plan isn't among them, so no plan and no access.
    expect(
      await verifyErxesAccessToken(issued.access_token, { coreUrl: server.url(''), plugin: 'hr' }),
    ).toMatchObject({
      role: 'owner',
      permissions: ['hr.leave.approve'],
      tier: null,
      access: 'off',
    });

    const userinfo = await fetch(server.url('/core/v1/oauth/userinfo'), {
      headers: server.headers(issued.access_token),
    });

    expect(await userinfo.json()).toMatchObject({ email: OWNER.email, organization: 'acme' });
  });

  it('rotates refresh tokens, revokes the family when one is reused, and ends with sign out everywhere', async () => {
    const { verifier, challenge } = pkce();
    const first = await granted(exchange((await codeFor(challenge)).code, verifier));
    const second = await granted(refresh(first.refresh_token));

    expect(second.refresh_token).not.toBe(first.refresh_token);

    // The first one again: stolen. Everything from that sign-in stops.
    expect((await token(refresh(first.refresh_token))).status).toBe(400);
    expect((await token(refresh(second.refresh_token))).status).toBe(400);

    // A new sign-in, then "sign out everywhere" in erxes.
    const again = pkce();
    const fresh = await granted(exchange((await codeFor(again.challenge)).code, again.verifier));

    await owner.api.auth.signOutEverywhere({});
    expect((await token(refresh(fresh.refresh_token))).status).toBe(400);
  });

  it('refuses a code sent to another address, with a changed secret, expired, or without the verifier', async () => {
    await owner.api.auth.signIn(OWNER);

    const { verifier, challenge } = pkce();
    const fresh = async () => (await codeFor(challenge)).code;

    const elsewhere = { ...exchange(await fresh(), verifier), redirect_uri: `${REDIRECT}/other` };

    expect((await token(elsewhere)).body).toEqual(refused);
    expect((await token(exchange(`${idOf(await fresh())}.changed`, verifier))).body).toEqual(
      refused,
    );
    expect((await token(exchange(idOf(await fresh()), verifier))).body).toEqual(refused);

    const { code_verifier: _, ...noVerifier } = exchange(await fresh(), verifier);

    expect((await token(noVerifier)).body).toEqual(refused);

    const expired = await fresh();

    await adminDb()
      .update(oauthCodes)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(oauthCodes.id, idOf(expired)));
    expect((await token(exchange(expired, verifier))).body).toEqual(refused);
    expect((await token(exchange('unknown.secret', verifier))).body).toEqual(refused);

    expect(await granted(exchange(await fresh(), verifier))).toMatchObject({
      token_type: 'Bearer',
    });

    const signIns = await adminDb()
      .select({ targetType: auditLogs.targetType, targetId: auditLogs.targetId })
      .from(auditLogs)
      .where(eq(auditLogs.action, 'auth.oauth_signed_in'));

    expect(signIns).toContainEqual({ targetType: 'plugin', targetId: 'hr' });
  });

  it('refuses a refresh token with a changed secret, past its expiry, or of a member no longer active', async () => {
    await owner.api.auth.signIn(OWNER);

    const { verifier, challenge } = pkce();
    const signIn = async () => granted(exchange((await codeFor(challenge)).code, verifier));

    const changed = await signIn();

    expect((await token(refresh(`${idOf(changed.refresh_token)}.changed`))).body).toEqual(refused);
    expect((await token(refresh('unknown.secret'))).body).toEqual(refused);
    expect(await granted(refresh(changed.refresh_token))).toMatchObject({ token_type: 'Bearer' });

    const expired = await signIn();

    await adminDb()
      .update(oauthRefreshTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(oauthRefreshTokens.id, idOf(expired.refresh_token)));
    expect((await token(refresh(expired.refresh_token))).body).toEqual(refused);

    const disabled = await signIn();

    await adminDb().update(users).set({ status: 'disabled' }).where(eq(users.email, OWNER.email));
    expect((await token(refresh(disabled.refresh_token))).body).toEqual(refused);
  });
});
