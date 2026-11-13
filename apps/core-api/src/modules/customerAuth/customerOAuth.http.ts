import { customerOauthCodes, newId, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import express, { type Request, type Response, Router } from 'express';
import { z } from 'zod';
import { config } from '~/config';
import { requestInfo } from '~/http/requestContext';
import { subdomainFromHost } from '~/modules/auth/auth.service';
import {
  allowedRedirect,
  challengeOf,
  clientOf,
  clientTitle,
  installed,
  newSecret,
  type OAuthClient,
  oauthError,
  param,
  redirectBack,
  RevokeForm,
  s256Challenge,
  sameHash,
  sha256,
  splitCredential,
  TokenForm,
} from '~/modules/oauth/oauthClients';
import { organizationOf } from './customerAuth.service';
import {
  browserSession,
  CUSTOMER_ACCESS_SECONDS,
  type CustomerSessionRef,
  createSession,
  customerAccessToken,
  revokeSessionToken,
  rotateSession,
} from './customerSessions';

/**
 * Customers sign in to plugins' apps (a shop, tracking, booking) through core:
 * OAuth 2.1, authorization code + PKCE (S256) only, the plugin is the client
 * and its manifest's `customerApp.redirectUris` the allowed addresses. One
 * sign-in on core's page serves every app of the organisation (decision 42).
 */
export const customerOAuthRouter = Router();

/** Core's page where customers type their address and code (`apps/core-ui`). */
const CUSTOMER_SIGN_IN_PAGE = '/customer-sign-in';

const CODE_SECONDS = 60;

const AuthorizeQuery = z.object({
  client_id: param,
  redirect_uri: param,
  response_type: param,
  code_challenge: param,
  code_challenge_method: param,
  state: param,
  /** The organisation's subdomain, when neither core's address nor the app's names it. */
  organization: param,
  /** `login`: ask again, even when this browser is signed in. */
  prompt: param,
});

/** The `{subdomain}` part of a redirect address, read against the app's templates. */
const subdomainInRedirect = (templates: string[], redirectUri: string) => {
  for (const template of templates) {
    const at = template.indexOf('{subdomain}');

    if (at < 0) continue;

    const before = template.slice(0, at);
    const after = template.slice(at + '{subdomain}'.length);

    if (
      redirectUri.length > before.length + after.length &&
      redirectUri.startsWith(before) &&
      redirectUri.endsWith(after)
    ) {
      const middle = redirectUri.slice(before.length, redirectUri.length - after.length);

      if (/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(middle)) return middle;
    }
  }

  return undefined;
};

const customerAppOf = (client: OAuthClient | null) => client?.manifest?.customerApp?.redirectUris;

customerOAuthRouter.get('/authorize', async (req: Request, res: Response) => {
  const query = AuthorizeQuery.parse(req.query);
  const client = await clientOf(query.client_id);
  const templates = customerAppOf(client) ?? [];

  // Until the redirect address is known to be the app's, errors are shown here, never sent there.
  if (!client || !templates.length) return oauthError(res, 400, 'invalid_client', 'Unknown app');

  const redirectUri = query.redirect_uri;

  if (!redirectUri) return oauthError(res, 400, 'invalid_request', 'redirect_uri is required');

  const subdomain =
    subdomainFromHost(req.get('host')) ??
    subdomainInRedirect(templates, redirectUri) ??
    (query.organization || config.auth.defaultSubdomain);

  if (!subdomain || !allowedRedirect(templates, redirectUri, subdomain)) {
    return oauthError(
      res,
      400,
      'invalid_request',
      'This redirect address is not registered for the app',
    );
  }

  const back = redirectBack({ redirect_uri: redirectUri, state: query.state });
  const codeChallenge = s256Challenge(query);

  if (query.response_type !== 'code')
    return res.redirect(302, back({ error: 'unsupported_response_type' }));

  if (!codeChallenge) {
    return res.redirect(
      302,
      back({ error: 'invalid_request', error_description: 'PKCE with S256 is required' }),
    );
  }

  const organization = await organizationOf(subdomain, undefined).catch(() => null);

  if (
    !organization ||
    !(await withOrg(organization.id, (tx) => installed(tx, organization.id, client.name)))
  ) {
    return res.redirect(
      302,
      back({
        error: 'access_denied',
        error_description: `${clientTitle(client)} is not installed in this organisation`,
      }),
    );
  }

  const session = query.prompt === 'login' ? null : await browserSession(req);

  if (session?.orgId !== organization.id) {
    // Sign in on core's page first (its `next` drops `prompt`, so it doesn't ask twice), then back here.
    const next = new URL(req.originalUrl, 'http://core');

    next.searchParams.delete('prompt');

    const page = new URLSearchParams({
      organization: organization.subdomain,
      app: clientTitle(client),
      next: next.pathname + next.search,
    });

    return res.redirect(302, `${CUSTOMER_SIGN_IN_PAGE}?${page.toString()}`);
  }

  const id = newId();
  const secret = newSecret();

  await withOrg(organization.id, (tx) =>
    tx.insert(customerOauthCodes).values({
      id,
      orgId: organization.id,
      clientId: client.name,
      customerId: session.customerId,
      codeHash: sha256(secret),
      redirectUri,
      codeChallenge,
      expiresAt: sql`now() + make_interval(secs => ${CODE_SECONDS})`,
    }),
  );

  res.redirect(302, back({ code: `${id}.${secret}` }));
});

const tokensFor = async (ref: CustomerSessionRef, client: OAuthClient, refreshToken: string) => ({
  access_token: await customerAccessToken(ref, client.name),
  token_type: 'Bearer',
  expires_in: CUSTOMER_ACCESS_SECONDS,
  refresh_token: refreshToken,
});

/** Tokens for an authorization code: once, by the app it was given to, with the PKCE verifier. */
const exchangeCode = async (
  client: OAuthClient,
  form: { code?: string; redirect_uri?: string; code_verifier?: string },
) => {
  const { id, secret } = splitCredential(form.code);

  const [code] = id
    ? await withSystem('customer oauth code lookup', (tx) =>
        tx.select().from(customerOauthCodes).where(eq(customerOauthCodes.id, id)).limit(1),
      )
    : [];

  if (
    !code ||
    !secret ||
    !sameHash(code.codeHash, secret) ||
    code.clientId !== client.name ||
    code.redirectUri !== form.redirect_uri ||
    code.expiresAt.getTime() < Date.now() ||
    !form.code_verifier ||
    challengeOf(form.code_verifier) !== code.codeChallenge
  ) {
    return null;
  }

  return withOrg(code.orgId, async (tx) => {
    const [used] = await tx
      .update(customerOauthCodes)
      .set({ usedAt: sql`now()` })
      .where(and(eq(customerOauthCodes.id, code.id), isNull(customerOauthCodes.usedAt)))
      .returning({ id: customerOauthCodes.id });

    if (!used || !(await installed(tx, code.orgId, client.name))) return null;

    const { ip, userAgent } = requestInfo();

    const session = await createSession(tx, {
      orgId: code.orgId,
      customerId: code.customerId,
      clientId: client.name,
      userAgent,
      ip,
    });

    return tokensFor(
      { orgId: code.orgId, customerId: code.customerId, sessionId: session.id },
      client,
      session.token,
    );
  });
};

/** Rotates an app's refresh token; one used twice ends its session. */
const refreshGrant = async (client: OAuthClient, form: { refresh_token?: string }) => {
  const rotated = await rotateSession(client.name, form.refresh_token);

  if (
    !rotated ||
    !(await withOrg(rotated.ref.orgId, (tx) => installed(tx, rotated.ref.orgId, client.name)))
  ) {
    return null;
  }

  return tokensFor(rotated.ref, client, rotated.token);
};

const tokenRouter = Router();

tokenRouter.use(express.urlencoded({ extended: false, limit: '16kb' }));

tokenRouter.post('/token', async (req: Request, res: Response) => {
  const form = TokenForm.parse(req.body);

  res.set('Cache-Control', 'no-store');

  const client = await clientOf(form.client_id);

  if (!client || !customerAppOf(client))
    return oauthError(res, 401, 'invalid_client', 'Unknown app');

  if (form.grant_type !== 'authorization_code' && form.grant_type !== 'refresh_token') {
    return oauthError(
      res,
      400,
      'unsupported_grant_type',
      'Use authorization_code or refresh_token',
    );
  }

  const tokens =
    form.grant_type === 'authorization_code'
      ? await exchangeCode(client, form)
      : await refreshGrant(client, form);

  return tokens
    ? res.json(tokens)
    : oauthError(
        res,
        400,
        'invalid_grant',
        form.grant_type === 'authorization_code'
          ? 'The code is not valid'
          : 'The refresh token is not valid',
      );
});

/** Signs the app out (ends its session). Always 200, as RFC 7009 asks. */
tokenRouter.post('/revoke', async (req: Request, res: Response) => {
  const form = RevokeForm.parse(req.body);

  if (form.client_id) await revokeSessionToken(form.token, form.client_id);

  res.status(200).json({});
});

customerOAuthRouter.use(tokenRouter);
