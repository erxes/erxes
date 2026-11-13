import { type Db, pluginInstallations, plugins, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import type { Response } from 'express';
import { z } from 'zod';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';

export const SCOPES = new Set(['openid', 'profile', 'email', 'offline_access']);

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
export const installed = (tx: Db, clientId: string) =>
  tx
    .select({ status: pluginInstallations.status })
    .from(pluginInstallations)
    .where(eq(pluginInstallations.plugin, clientId))
    .limit(1)
    .then(([row]) => row?.status === 'active');
