import { type Db, pluginInstallations, plugins, withSystem } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { ISSUER } from '~/lib/signing';

export const SCOPES = new Set(['openid', 'profile', 'email', 'offline_access']);

/** A form or query parameter: text, or missing (a repeated or nested one counts as missing). */
export const param = z.string().optional().catch(undefined);

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** The PKCE S256 challenge of a verifier. */
export const challengeOf = (verifier: string) =>
  createHash('sha256').update(verifier).digest().toString('base64url');

/** A new `<id>.<secret>` credential, of which only the secret's hash is stored. */
export const newSecret = () => randomBytes(32).toString('base64url');

/** `<id>.<secret>` split in two; either part may be empty. */
export const splitCredential = (value: string | undefined) => {
  const [id = '', secret = ''] = (value ?? '').split('.');

  return { id, secret };
};

export const sameHash = (stored: string, value: string) => {
  const a = Buffer.from(stored);
  const b = Buffer.from(sha256(value));

  return a.length === b.length && timingSafeEqual(a, b);
};

export const oauthError = (res: Response, status: number, error: string, description: string) =>
  res.status(status).json({ error, error_description: description });

/** The redirect address, if the client lists it (with `{subdomain}` the organisation's). */
export const allowedRedirect = (templates: string[], given: string, subdomain: string | null) =>
  templates.some(
    (template) => (subdomain ? template.replaceAll('{subdomain}', subdomain) : template) === given,
  );

const withParams = (url: string, params: Record<string, string | undefined>) => {
  const target = new URL(url);

  for (const [key, value] of Object.entries(params))
    if (value !== undefined) target.searchParams.set(key, value);

  return target.toString();
};

/** The app's address with the answer (`code` or `error`), its `state` and core as the issuer. */
export const redirectBack =
  (query: { redirect_uri: string; state?: string }) =>
  (params: Record<string, string | undefined>) =>
    withParams(query.redirect_uri, { ...params, state: query.state, iss: ISSUER });

/** The PKCE challenge, when the request uses S256 properly (the only method allowed). */
export const s256Challenge = (query: { code_challenge?: string; code_challenge_method?: string }) =>
  query.code_challenge &&
  query.code_challenge_method === 'S256' &&
  /^[A-Za-z0-9_-]{43}$/.test(query.code_challenge)
    ? query.code_challenge
    : null;

/** The token endpoint's form (OAuth: `application/x-www-form-urlencoded`). */
export const TokenForm = z
  .object({
    client_id: param,
    grant_type: param,
    code: param,
    redirect_uri: param,
    code_verifier: param,
    refresh_token: param,
  })
  .catch({});

export const RevokeForm = z.object({ token: param, client_id: param }).catch({});

/** An active plugin acting as an OAuth client. */
export const clientOf = async (clientId: string | undefined) => {
  if (!clientId) return null;

  const [row] = await withSystem('oauth client', (tx) =>
    tx
      .select({ name: plugins.name, status: plugins.status, manifest: plugins.manifest })
      .from(plugins)
      .where(eq(plugins.name, clientId))
      .limit(1),
  );

  return row?.status === 'active' ? row : null;
};

export type OAuthClient = NonNullable<Awaited<ReturnType<typeof clientOf>>>;

export const clientTitle = (client: OAuthClient) => client.manifest?.title ?? client.name;

/** Whether the organisation has the client's plugin installed. */
export const installed = (tx: Db, orgId: string, clientId: string) =>
  tx
    .select({ status: pluginInstallations.status })
    .from(pluginInstallations)
    .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.plugin, clientId)))
    .limit(1)
    .then(([row]) => row?.status === 'active');
