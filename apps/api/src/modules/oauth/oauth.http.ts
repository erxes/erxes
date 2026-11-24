import { organizations, users, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import express, { type Request, type RequestHandler, type Response, Router } from 'express';
import { z } from 'zod';
import { sessionClaims } from '~/http/auth';
import { ISSUER, verifyJwt } from '~/lib/signing';
import { registerClient } from './oauthApps';
import {
  AuthorizeQuery,
  answerTo,
  checkAuthorization,
  consentRequest,
  issueCode,
} from './oauthAuthorize';
import {
  APP_SCOPES,
  apiBaseOf,
  clientOf,
  oauthError,
  param,
  redirectAllowed,
  usable,
} from './oauthClients';
import { exchangeCode, refreshGrant, revokeFamily } from './oauthGrants';

/**
 * OAuth 2.1 with OpenID Connect. Two kinds of client: a plugin's own app ("Sign in with erxes",
 * its manifest lists its redirect addresses, the organisation installing the plugin allows it)
 * and an app acting as the member through the MCP server, which the member allows on the consent
 * page. Authorization code + PKCE (S256) only; access and ID tokens are ES256 JWTs anyone can
 * check with the JWKS; refresh tokens rotate and a reused one revokes its family.
 */
const oauthRouter = Router();

/** RFC 6749 3.1: a parameter sent twice (or nested) is an invalid request. */
const REPEATED = 'Send each parameter once, as text';

/** Where web shows an app's request for the member to allow or refuse. */
const CONSENT_PAGE = '/connect';

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

  if (
    !row ||
    row.user.status !== 'active' ||
    !row.user.canSignIn ||
    row.user.sessionVersion !== claims.sessionVersion
  )
    return null;

  return row;
};

oauthRouter.get('/authorize', async (req: Request, res: Response) => {
  const { data: query } = AuthorizeQuery.safeParse(req.query);

  if (!query) return oauthError(res, 400, 'invalid_request', REPEATED);

  const client = await clientOf(query.client_id);

  // Until the redirect address is known to be the client's, errors are shown here, never sent there.
  if (!client || !client.redirectUris.length) {
    return oauthError(res, 400, 'invalid_client', 'Unknown app');
  }

  const redirectUri = query.redirect_uri;

  if (!redirectUri) return oauthError(res, 400, 'invalid_request', 'redirect_uri is required');

  const member = await memberOfSession(req);

  if (!member) {
    // Sign in first, then come back here.
    return res.redirect(302, `/?next=${encodeURIComponent(req.originalUrl)}`);
  }

  if (!redirectAllowed(client, redirectUri, member.subdomain)) {
    return oauthError(
      res,
      400,
      'invalid_request',
      'This redirect address is not registered for the app',
    );
  }

  const checked = checkAuthorization(
    client,
    { ...query, redirect_uri: redirectUri },
    apiBaseOf(req),
  );

  if ('refused' in checked) return res.redirect(302, checked.refused);

  const { authorization } = checked;
  const { user } = member;

  // An app acts as the member: they allow it themselves.
  if (client.kind === 'app') {
    const request = await consentRequest(authorization, client, {
      orgId: user.orgId,
      userId: user.id,
    });

    return res.redirect(302, `${CONSENT_PAGE}?request=${encodeURIComponent(request)}`);
  }

  const answer = await withOrg(user.orgId, async (tx) =>
    (await usable(tx, client))
      ? answerTo(authorization, { code: await issueCode(tx, authorization, user.id) })
      : answerTo(authorization, {
          error: 'access_denied',
          error_description: `${client.title} is not installed in your organisation`,
        }),
  );

  res.redirect(302, answer);
});

const TokenForm = z.object({
  client_id: param,
  grant_type: param,
  code: param,
  redirect_uri: param,
  code_verifier: param,
  refresh_token: param,
  resource: param,
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

oauthRouter.post('/register', express.json({ limit: '16kb' }), registerClient);

const AccessTokenClaims = z.object({
  sub: z.string(),
  org: z.string(),
  scope: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

/** OpenID Connect userinfo for a plugin app's access token. */
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

  if (!row || row.user.status !== 'active' || !row.user.canSignIn) {
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

/** The endpoints both kinds of client use, on this request's address. */
const endpointsOf = (base: string) => ({
  authorization_endpoint: `${base}/oauth/authorize`,
  token_endpoint: `${base}/oauth/token`,
  revocation_endpoint: `${base}/oauth/revoke`,
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
});

/** OpenID Connect discovery for plugins' own apps (addresses relative to where core is reached). */
const openidConfiguration = (req: Request, res: Response) => {
  const base = apiBaseOf(req);

  res.set('Cache-Control', 'public, max-age=300').json({
    issuer: ISSUER,
    ...endpointsOf(base),
    userinfo_endpoint: `${base}/oauth/userinfo`,
    jwks_uri: `${base}/.well-known/jwks.json`,
    scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
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

/**
 * Authorization server metadata (RFC 8414) for apps: the issuer is core's API address, from
 * which this document is found at `/.well-known/oauth-authorization-server/core/v1`. Apps name
 * themselves with a metadata document or register.
 */
const authorizationServerMetadata = (req: Request, res: Response) => {
  const base = apiBaseOf(req);

  res.set('Cache-Control', 'public, max-age=300').json({
    issuer: base,
    ...endpointsOf(base),
    registration_endpoint: `${base}/oauth/register`,
    scopes_supported: APP_SCOPES,
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
  });
};

/** OAuth's routes, from the app's root, with the limits they take: they sign in on their own. */
export const oauthRoutes = (limits: { register: RequestHandler; token: RequestHandler }) => {
  const routes = Router();

  routes.use('/core/v1/oauth/register', limits.register);
  routes.use('/core/v1/oauth', limits.token, oauthRouter);
  routes.get('/core/v1/.well-known/openid-configuration', openidConfiguration);
  // RFC 8414 puts the issuer's path after the well-known name; some clients look under it.
  routes.get('/.well-known/oauth-authorization-server/core/v1', authorizationServerMetadata);
  routes.get('/core/v1/.well-known/oauth-authorization-server', authorizationServerMetadata);

  return routes;
};
