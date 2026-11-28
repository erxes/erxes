import { newId, oauthClients, withSystem } from '@erxes/core-db';
import { OAUTH_GRANT_TYPES } from '@erxes/core-db/enums';
import { and, eq, isNull, lt, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { requestOutbound } from '~/lib/outbound';
import { logger } from '~/logger';

/**
 * An app that acts as a member through the MCP server, such as Claude or ChatGPT. It names
 * itself with a client metadata document at an https address (`client_id` is that address), or
 * registers itself (RFC 7591) and gets an id. Either way it is a public client: PKCE, no secret.
 */
export interface AppClient {
  kind: 'app';
  id: string;
  title: string;
  redirectUris: string[];
  /** The host that published its metadata document; null for one that registered itself. */
  address: string | null;
}

const METADATA_TIMEOUT_MS = 5000;

const METADATA_MAX_BYTES = 64_000;

const METADATA_FRESH_MS = 5 * 60_000;

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);

const log = logger.child({ component: 'oauth' });

const isLoopback = (url: URL) => url.protocol === 'http:' && LOOPBACK.has(url.hostname);

/** https, or http on this computer for an app's local callback (RFC 8252). */
const RedirectUri = z.url().refine((value) => {
  const url = new URL(value);

  return !url.hash && (url.protocol === 'https:' || isLoopback(url));
}, 'Use an https address, or http on localhost');

const ClientName = z.string().trim().min(1).max(100);

const RedirectUris = z.array(RedirectUri).min(1).max(20);

/**
 * The redirect address is the app's: exactly one it lists, or for a local callback the same
 * address on any port, which a native app picks when it starts listening (RFC 8252 7.3).
 */
export const appRedirectAllowed = (client: AppClient, given: string) => {
  const target = URL.parse(given);

  return client.redirectUris.some((listed) => {
    const url = URL.parse(listed);

    if (listed === given) return true;

    return (
      url !== null &&
      target !== null &&
      isLoopback(url) &&
      isLoopback(target) &&
      url.hostname === target.hostname &&
      url.pathname === target.pathname &&
      url.search === target.search
    );
  });
};

/** A client id that is a metadata document's address: https, with a path, nothing else. */
export const isMetadataAddress = (clientId: string) => {
  const url = URL.parse(clientId);

  return (
    url?.protocol === 'https:' &&
    url.pathname !== '/' &&
    !url.hash &&
    !url.username &&
    !url.password &&
    url.href === clientId
  );
};

const ClientMetadata = z.object({
  client_id: z.string(),
  client_name: ClientName,
  redirect_uris: RedirectUris,
  token_endpoint_auth_method: z.literal('none').default('none'),
});

const readMetadata = async (address: string): Promise<AppClient | null> => {
  try {
    const answer = await requestOutbound(address, {
      method: 'GET',
      body: '',
      headers: { accept: 'application/json' },
      timeoutMs: METADATA_TIMEOUT_MS,
      maxBytes: METADATA_MAX_BYTES,
      overflow: 'fail',
    });

    const json: unknown = answer.status === 200 ? JSON.parse(answer.body.toString()) : null;
    const metadata = ClientMetadata.safeParse(json).data;

    // The document names itself: one at another address is not this app's.
    if (!metadata || metadata.client_id !== address) return null;

    return {
      kind: 'app',
      id: address,
      title: metadata.client_name,
      redirectUris: metadata.redirect_uris,
      address: new URL(address).host,
    };
  } catch (error) {
    log.warn({ err: error, address }, 'oauth: a client metadata document could not be read');

    return null;
  }
};

const documents = new Map<string, { until: number; client: Promise<AppClient | null> }>();

/** The app a metadata document describes, read at most every 5 minutes; a failure isn't kept. */
export const metadataClient = (address: string) => {
  const known = documents.get(address);

  if (known && known.until > Date.now()) return known.client;

  const client = readMetadata(address).then((found) => {
    if (!found) documents.delete(address);

    return found;
  });

  documents.set(address, { until: Date.now() + METADATA_FRESH_MS, client });

  return client;
};

/** An app that registered itself. */
export const registeredClient = async (clientId: string): Promise<AppClient | null> => {
  const [row] = await withSystem('oauth registered client', (tx) =>
    tx.select().from(oauthClients).where(eq(oauthClients.id, clientId)).limit(1),
  );

  return row
    ? { kind: 'app', id: row.id, title: row.name, redirectUris: row.redirectUris, address: null }
    : null;
};

/** A registered app got a code: it stays past its first day. */
export const markClientUsed = (clientId: string) =>
  withSystem('oauth client used', (tx) =>
    tx
      .update(oauthClients)
      .set({ usedAt: sql`now()` })
      .where(and(eq(oauthClients.id, clientId), isNull(oauthClients.usedAt))),
  );

const Registration = z.object({
  client_name: ClientName.optional(),
  redirect_uris: RedirectUris,
  token_endpoint_auth_method: z.literal('none').optional(),
  grant_types: z.array(z.enum(OAUTH_GRANT_TYPES)).optional(),
  response_types: z.array(z.literal('code')).optional(),
});

/**
 * `POST /core/v1/oauth/register`: dynamic client registration (RFC 7591) for public clients.
 * Registering drops the apps that never got a code within a day of registering.
 */
export const registerClient = async (req: Request, res: Response) => {
  const parsed = Registration.safeParse(req.body);

  res.set('Cache-Control', 'no-store');

  if (!parsed.success) {
    const [issue] = parsed.error.issues;

    return res.status(400).json({
      error:
        issue?.path[0] === 'redirect_uris' ? 'invalid_redirect_uri' : 'invalid_client_metadata',
      error_description: issue?.message ?? 'The registration is not valid',
    });
  }

  const { client_name: name = 'MCP client', redirect_uris: redirectUris } = parsed.data;
  const id = newId();

  await withSystem('oauth registration', async (tx) => {
    await tx
      .delete(oauthClients)
      .where(
        and(isNull(oauthClients.usedAt), lt(oauthClients.createdAt, sql`now() - interval '1 day'`)),
      );
    await tx.insert(oauthClients).values({ id, name, redirectUris });
  });

  return res.status(201).json({
    client_id: id,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: name,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: 'none',
    grant_types: OAUTH_GRANT_TYPES,
    response_types: ['code'],
  });
};
