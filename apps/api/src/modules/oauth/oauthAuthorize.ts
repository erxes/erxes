import { type Db, newId, oauthCodes } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { sha256 } from '~/lib/crypto';
import { ISSUER, signJwt, verifyJwt } from '~/lib/signing';
import type { AppClient } from './oauthApps';
import { mcpResourceOf, newSecret, type OAuthClient, param, scopeFor } from './oauthClients';

const CODE_SECONDS = 60;

const CONSENT_SECONDS = 600;

/** JOSE `typ` of the request a member allows or refuses on the consent page. */
const CONSENT_TYP = 'erxes-oauth-consent+jwt';

export const AuthorizeQuery = z.object({
  client_id: param,
  redirect_uri: param,
  response_type: param,
  code_challenge: param,
  code_challenge_method: param,
  scope: param,
  state: param,
  nonce: param,
  resource: param,
});

export type AuthorizeQuery = z.infer<typeof AuthorizeQuery>;

/** An authorization request that passed its checks: what its code is for. */
const Authorization = z.object({
  clientId: z.string(),
  redirectUri: z.string(),
  codeChallenge: z.string(),
  scope: z.string(),
  state: z.string().optional(),
  nonce: z.string().optional(),
  /** The MCP server an app's tokens are for; null for a plugin's own app. */
  resource: z.string().nullable(),
  /** The `iss` the client checks in the answer (RFC 9207). */
  issuer: z.string(),
});

export type Authorization = z.infer<typeof Authorization>;

const withParams = (url: string, params: Record<string, string | undefined>) => {
  const target = new URL(url);

  for (const [key, value] of Object.entries(params))
    if (value !== undefined) target.searchParams.set(key, value);

  return target.toString();
};

/** The redirect back to the client with `params`, its state and the issuer. */
export const answerTo = (
  to: Pick<Authorization, 'redirectUri' | 'state' | 'issuer'>,
  params: Record<string, string | undefined>,
) => withParams(to.redirectUri, { ...params, state: to.state, iss: to.issuer });

/**
 * Checks a request whose redirect address is the client's: the code flow with PKCE (S256), and
 * for an app, the MCP server on `base` as the resource. Answers the request, or the error to
 * send back.
 */
export const checkAuthorization = (
  client: OAuthClient,
  query: AuthorizeQuery & { redirect_uri: string },
  base: string,
): { authorization: Authorization } | { refused: string } => {
  const app = client.kind === 'app';
  const issuer = app ? base : ISSUER;

  const back = (params: Record<string, string>) =>
    answerTo({ redirectUri: query.redirect_uri, state: query.state, issuer }, params);

  if (query.response_type !== 'code')
    return { refused: back({ error: 'unsupported_response_type' }) };

  const codeChallenge = query.code_challenge;

  if (
    !codeChallenge ||
    query.code_challenge_method !== 'S256' ||
    !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)
  ) {
    return {
      refused: back({ error: 'invalid_request', error_description: 'PKCE with S256 is required' }),
    };
  }

  const resource = app ? mcpResourceOf(base) : null;

  if (query.resource !== undefined && query.resource !== resource) {
    return {
      refused: back({
        error: 'invalid_target',
        error_description: resource
          ? `This server gives tokens for ${resource} only`
          : 'A plugin app asks for no resource',
      }),
    };
  }

  return {
    authorization: {
      clientId: client.id,
      redirectUri: query.redirect_uri,
      codeChallenge,
      scope: scopeFor(client, query.scope),
      state: query.state,
      nonce: query.nonce?.slice(0, 200),
      resource,
      issuer,
    },
  };
};

/** A code for the member, valid a minute, once, with the PKCE verifier. */
export const issueCode = async (tx: Db, authorization: Authorization, userId: string) => {
  const id = newId();
  const secret = newSecret();

  await tx.insert(oauthCodes).values({
    id,
    clientId: authorization.clientId,
    userId,
    codeHash: sha256(secret),
    redirectUri: authorization.redirectUri,
    codeChallenge: authorization.codeChallenge,
    scope: authorization.scope,
    resource: authorization.resource,
    nonce: authorization.nonce ?? null,
    expiresAt: sql`now() + make_interval(secs => ${CODE_SECONDS})`,
  });

  return `${id}.${secret}`;
};

/** The request the member allows or refuses on the consent page, signed for them, 10 minutes. */
export const consentRequest = (
  authorization: Authorization,
  app: AppClient,
  member: { orgId: string; userId: string },
) =>
  signJwt(
    { org: member.orgId, authorization, app: { title: app.title, address: app.address } },
    {
      typ: CONSENT_TYP,
      audience: ISSUER,
      subject: member.userId,
      expiresInSeconds: CONSENT_SECONDS,
    },
  );

const ConsentClaims = z.object({
  sub: z.string(),
  org: z.string(),
  authorization: Authorization,
  /** The app as it named itself when it asked. */
  app: z.object({ title: z.string(), address: z.string().nullable() }),
});

/** The request a consent token carries, if core signed it and it hasn't expired. */
export const consentOf = (token: string) =>
  verifyJwt(token, ConsentClaims, { typ: CONSENT_TYP, audience: ISSUER }).catch(() => null);
