import { type Db, pluginInstallations, plugins, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import {
  type AppClient,
  appRedirectAllowed,
  isMetadataAddress,
  metadataClient,
  registeredClient,
} from './oauthApps';

/** What a plugin's own app may ask for: OpenID Connect sign-in. */
const PLUGIN_SCOPES = new Set(['openid', 'profile', 'email', 'offline_access']);

/** What an app asks for: the MCP server, as the member. */
export const APP_SCOPES = ['mcp', 'offline_access'];

/** A form or query parameter: text, or missing (a repeated or nested one fails the parse). */
export const param = z.string().optional();

/** A new `<id>.<secret>` credential, of which only the secret's hash is stored. */
export const newSecret = () => randomToken(32);

/** `<id>.<secret>` split in two; either part may be empty. */
export const splitCredential = (value: string | undefined) => {
  const [id = '', secret = ''] = (value ?? '').split('.');

  return { id, secret };
};

export const sameHash = (stored: string, value: string) => safeEqual(stored, sha256(value));

export const oauthError = (res: Response, status: number, error: string, description: string) =>
  res.status(status).json({ error, error_description: description });

/** Where core's API is reached on this request: the OAuth issuer of apps, and their base. */
export const apiBaseOf = (req: Request) => `${req.protocol}://${req.get('host')}/core/v1`;

/** The MCP server on that base: the only resource an app's token is for (RFC 8707). */
export const mcpResourceOf = (base: string) => `${base}/mcp`;

/** An active plugin's own app: "Sign in with erxes". Its manifest lists its redirect addresses. */
const pluginClient = async (clientId: string) => {
  const [row] = await withSystem('oauth client', (tx) =>
    tx
      .select({ name: plugins.name, status: plugins.status, manifest: plugins.manifest })
      .from(plugins)
      .where(eq(plugins.name, clientId))
      .limit(1),
  );

  return row?.status === 'active'
    ? {
        kind: 'plugin' as const,
        id: row.name,
        title: row.manifest?.title ?? row.name,
        redirectUris: row.manifest?.oauth?.redirectUris ?? [],
        manifest: row.manifest,
      }
    : null;
};

/** A plugin's own app, an app with a metadata document, or one that registered itself. */
export const clientOf = async (clientId: string | undefined) => {
  if (!clientId) return null;

  if (isMetadataAddress(clientId)) return metadataClient(clientId);

  return (await pluginClient(clientId)) ?? registeredClient(clientId);
};

export type OAuthClient = NonNullable<Awaited<ReturnType<typeof pluginClient>>> | AppClient;

/** The redirect address, if the client lists it (in a plugin's, `{subdomain}` the organisation's). */
export const redirectAllowed = (client: OAuthClient, given: string, subdomain: string | null) =>
  client.kind === 'app'
    ? appRedirectAllowed(client, given)
    : client.redirectUris.some(
        (template) =>
          (subdomain ? template.replaceAll('{subdomain}', subdomain) : template) === given,
      );

/** The scopes asked for that the client may have, or its default. */
export const scopeFor = (client: OAuthClient, asked: string | undefined) => {
  const allowed = client.kind === 'app' ? new Set(APP_SCOPES) : PLUGIN_SCOPES;
  const given = (asked ?? '').split(' ').filter((item) => allowed.has(item));

  // An app always gets the MCP server: a client that asks for nothing means it.
  if (client.kind === 'app') return [...new Set(['mcp', ...given])].join(' ');

  return given.join(' ') || 'openid';
};

/** Whether the organisation can use the client: its plugin installed, or any app. */
export const usable = async (tx: Db, client: OAuthClient) => {
  if (client.kind === 'app') return true;

  const [row] = await tx
    .select({ status: pluginInstallations.status })
    .from(pluginInstallations)
    .where(eq(pluginInstallations.plugin, client.id))
    .limit(1);

  return row?.status === 'active';
};
