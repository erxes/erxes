import { newId, oauthCodes, organizations, users, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import express, { type Request, type Response, Router } from 'express';
import { z } from 'zod';
import { sessionClaims } from '~/http/auth';
import { sha256 } from '~/lib/crypto';
import { ISSUER, verifyJwt } from '~/lib/signing';
import {
  clientOf,
  clientTitle,
  installed,
  type OAuthClient,
  newSecret,
  oauthError,
  param,
  SCOPES,
} from './oauthClients';
import { exchangeCode, refreshGrant, revokeFamily } from './oauthGrants';

/**
 * "Sign in with erxes": OAuth 2.1 with OpenID Connect for plugins' own apps
 * (a plugin is the client; its manifest lists its redirect addresses).
 * Authorization code + PKCE (S256) only; access and ID tokens are ES256
 * JWTs anyone can check with the JWKS; refresh tokens rotate and a reused one
 * revokes its family.
 */
export const oauthRouter = Router();

const CODE_SECONDS = 60;

/** RFC 6749 3.1: a parameter sent twice (or nested) is an invalid request. */
const REPEATED = 'Send each parameter once, as text';

const AuthorizeQuery = z.object({
  client_id: param,
  redirect_uri: param,
  response_type: param,
  code_challenge: param,
  code_challenge_method: param,
  scope: param,
  state: param,
  nonce: param,
});

type AuthorizeRequest = z.infer<typeof AuthorizeQuery> & { redirect_uri: string };

/** The redirect address, if the client lists it (with `{subdomain}` the organisation's). */
const allowedRedirect = (templates: string[], given: string, subdomain: string | null) =>
  templates.some(
    (template) => (subdomain ? template.replaceAll('{subdomain}', subdomain) : template) === given,
  );

const withParams = (url: string, params: Record<string, string | undefined>) => {
  const target = new URL(url);

  for (const [key, value] of Object.entries(params))
    if (value !== undefined) target.searchParams.set(key, value);

  return target.toString();
};

/** The signed-in member behind the session cookie, if still valid. */
const memberOfSession = async (req: Request) => {
  const claims = await sessionClaims(req);

  if (!claims) return null;

  const [row] = await withOrg(claims.orgId, (tx) =>
    tx
      .select({ user: users, subdomain: organizations.subdomain })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(eq(users.id, claims.userId))
      .limit(1),
  );

  if (!row || row.user.status !== 'active' || row.user.sessionVersion !== claims.sessionVersion)
    return null;

  return row;
};

/** The redirect back to the app: a code, or the OAuth error. */
const codeRedirect = (
  client: OAuthClient,
  query: AuthorizeRequest,
  user: { orgId: string; id: string },
) => {
  const back = (params: Record<string, string | undefined>) =>
    withParams(query.redirect_uri, { ...params, state: query.state, iss: ISSUER });

  if (query.response_type !== 'code') return back({ error: 'unsupported_response_type' });

  const codeChallenge = query.code_challenge;

  if (
    !codeChallenge ||
    query.code_challenge_method !== 'S256' ||
    !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)
  ) {
    return back({ error: 'invalid_request', error_description: 'PKCE with S256 is required' });
  }

  const scope = (query.scope ?? 'openid').split(' ').filter((item) => SCOPES.has(item));

  return withOrg(user.orgId, async (tx) => {
    if (!(await installed(tx, client.name))) {
      return back({
        error: 'access_denied',
        error_description: `${clientTitle(client)} is not installed in your organisation`,
      });
    }

    const id = newId();
    const secret = newSecret();

    await tx.insert(oauthCodes).values({
      id,
      clientId: client.name,
      userId: user.id,
      codeHash: sha256(secret),
      redirectUri: query.redirect_uri,
      codeChallenge,
      scope: scope.join(' ') || 'openid',
      nonce: query.nonce?.slice(0, 200) ?? null,
      expiresAt: sql`now() + make_interval(secs => ${CODE_SECONDS})`,
    });

    return back({ code: `${id}.${secret}` });
  });
};

oauthRouter.get('/authorize', async (req: Request, res: Response) => {
  const { data: query } = AuthorizeQuery.safeParse(req.query);

  if (!query) return oauthError(res, 400, 'invalid_request', REPEATED);

  const client = await clientOf(query.client_id);
  const templates = client?.manifest?.oauth?.redirectUris ?? [];

  // Until the redirect address is known to be the client's, errors are shown here, never sent there.
  if (!client || !templates.length) return oauthError(res, 400, 'invalid_client', 'Unknown app');

  const redirectUri = query.redirect_uri;

  if (!redirectUri) return oauthError(res, 400, 'invalid_request', 'redirect_uri is required');

  const member = await memberOfSession(req);

  if (!member) {
    // Sign in first, then come back here.
    return res.redirect(302, `/?next=${encodeURIComponent(req.originalUrl)}`);
  }

  if (!allowedRedirect(templates, redirectUri, member.subdomain)) {
    return oauthError(
      res,
      400,
      'invalid_request',
      'This redirect address is not registered for the app',
    );
  }

  res.redirect(
    302,
    await codeRedirect(client, { ...query, redirect_uri: redirectUri }, member.user),
  );
});

const TokenForm = z.object({
  client_id: param,
  grant_type: param,
  code: param,
  redirect_uri: param,
  code_verifier: param,
  refresh_token: param,
});

const RevokeForm = z.object({ token: param });

const tokenRouter = Router();

tokenRouter.use(express.urlencoded({ extended: false, limit: '16kb' }));

tokenRouter.post('/token', async (req: Request, res: Response) => {
  const { data: form } = TokenForm.safeParse(req.body);

  res.set('Cache-Control', 'no-store');

  if (!form) return oauthError(res, 400, 'invalid_request', REPEATED);

  const client = await clientOf(form.client_id);

  if (!client) return oauthError(res, 401, 'invalid_client', 'Unknown app');

  const grant =
    form.grant_type === 'authorization_code'
      ? await exchangeCode(client, form)
      : form.grant_type === 'refresh_token'
        ? await refreshGrant(client, form)
        : null;

  if (!grant) {
    return oauthError(
      res,
      400,
      'unsupported_grant_type',
      'Use authorization_code or refresh_token',
    );
  }

  return 'tokens' in grant
    ? res.json(grant.tokens)
    : oauthError(res, 400, 'invalid_grant', grant.refused);
});

/** Ends a refresh token's family (logging out of the app). Always 200, as RFC 7009 asks. */
tokenRouter.post('/revoke', async (req: Request, res: Response) => {
  await revokeFamily(RevokeForm.safeParse(req.body).data?.token);

  res.status(200).json({});
});

oauthRouter.use(tokenRouter);

const AccessTokenClaims = z.object({
  sub: z.string(),
  org: z.string(),
  scope: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

/** OpenID Connect userinfo for an access token. */
oauthRouter.get('/userinfo', async (req, res) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';

  const claims = await verifyJwt(token, AccessTokenClaims, { typ: 'at+jwt' }).catch(() => null);

  if (!claims) {
    oauthError(res, 401, 'invalid_token', 'The access token is not valid');

    return;
  }

  const [row] = await withOrg(claims.org, (tx) =>
    tx
      .select({ user: users, subdomain: organizations.subdomain })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(eq(users.id, claims.sub))
      .limit(1),
  );

  if (!row || row.user.status !== 'active') {
    oauthError(res, 401, 'invalid_token', 'The member is not active');

    return;
  }

  const scopes = (claims.scope ?? '').split(' ');

  res.json({
    sub: claims.sub,
    org: claims.org,
    organization: row.subdomain,
    role: claims.role,
    permissions: claims.permissions ?? [],
    ...(scopes.includes('email') ? { email: row.user.email, email_verified: true } : {}),
    ...(scopes.includes('profile')
      ? { name: row.user.fullName ?? row.user.email, picture: row.user.avatarUrl }
      : {}),
  });
});

/** OpenID Connect discovery (addresses relative to where core is reached). */
export const openidConfiguration = (req: Request, res: Response) => {
  const base = `${req.protocol}://${req.get('host')}/core/v1`;

  res.set('Cache-Control', 'public, max-age=300').json({
    issuer: ISSUER,
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/oauth/token`,
    userinfo_endpoint: `${base}/oauth/userinfo`,
    revocation_endpoint: `${base}/oauth/revoke`,
    jwks_uri: `${base}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [...SCOPES],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['ES256'],
    claims_supported: [
      'sub',
      'org',
      'organization',
      'email',
      'email_verified',
      'name',
      'given_name',
      'family_name',
      'picture',
      'nonce',
    ],
  });
};
