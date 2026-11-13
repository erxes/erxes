import { type Db, pluginInstallations, plugins, withSystem } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const SCOPES = new Set(['openid', 'profile', 'email', 'offline_access']);

/** A form or query parameter: text, or missing (a repeated or nested one fails the parse). */
export const param = z.string().optional();

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
