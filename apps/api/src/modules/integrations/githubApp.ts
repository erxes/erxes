import { type Db, integrationConnections, integrationOAuthApps } from '@erxes/core-db';
import { gatewayHttp, parse } from '@erxes/plugin-sdk/integrations';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256, safeEqual, sign } from '~/lib/crypto';
import { readSecret, saveSecret } from '~/modules/secrets/vault';
import type { ConnectionRow } from './connections';

const API = 'https://api.github.com';

const TICKET_MINUTES = 10;

const RENEW_MARGIN_SECONDS = 300;

const HEADERS = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

/** Refuses keys for an organisation's GitHub connection: it only comes from the App. */
export const ensureNotAppOnly = (key: string, ownerId: string | null) => {
  if (key === 'github' && ownerId === null)
    throw fail('NOT_ALLOWED', 'Connect GitHub for the organisation through the GitHub App');
};

export const GithubApp = z.object({
  id: z.string().regex(/^\d+$/),
  slug: z.string().min(1),
  privateKey: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
});

export type GithubApp = z.output<typeof GithubApp>;

/** The organisation's own GitHub App, kept with the OAuth apps under the key `github`. */
export const ownApp = async (tx: Db) => {
  const [row] = await tx
    .select({ id: integrationOAuthApps.id, secretId: integrationOAuthApps.secretId })
    .from(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, 'github'))
    .limit(1);

  return row
    ? {
        rowId: row.id,
        secretId: row.secretId,
        ...GithubApp.parse(JSON.parse(await readSecret(tx, row.secretId))),
      }
    : null;
};

/** The server's App (GITHUB_APP_* in .env), else the organisation's own; null: none. */
const appOf = async (tx: Db): Promise<GithubApp | null> =>
  config.integrations.githubApp ?? (await ownApp(tx));

/** The App the organisation connects GitHub through; 400 NOT_SET_UP without one. */
export const appIn = async (tx: Db) => {
  const app = await appOf(tx);

  if (!app) throw fail('NOT_SET_UP', 'Set up the GitHub App in Settings › Integrations › GitHub');

  return app;
};

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/** The App's own token: a 9-minute RS256 JWT, for the /app endpoints. */
const appJwt = (app: GithubApp) => {
  const now = Math.floor(Date.now() / 1000);
  const head = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: app.id }));
  const signature = sign('RSA-SHA256', Buffer.from(`${head}.${body}`), app.privateKey);

  return `${head}.${body}.${base64url(signature)}`;
};

const send = async <T>(
  schema: z.ZodType<T>,
  url: string,
  init: { method?: string; token: string; form?: Record<string, string> },
) => {
  const text = await gatewayHttp(
    'GitHub',
    '',
    {},
  )(url, {
    method: init.method ?? 'GET',
    headers: {
      ...HEADERS,
      ...(init.token && { Authorization: `Bearer ${init.token}` }),
      ...(init.form && { 'Content-Type': 'application/x-www-form-urlencoded' }),
    },
    body: init.form && new URLSearchParams(init.form).toString(),
  });

  return parse('GitHub', schema, text, `an unreadable ${url} answer`);
};

/** The App as GitHub knows it, read with its own JWT: proves the id and private key match. */
export const appProfile = (app: Omit<GithubApp, 'slug'>) =>
  send(z.object({ slug: z.string().min(1), name: z.string() }), `${API}/app`, {
    token: appJwt({ ...app, slug: '' }),
  });

const Account = z.object({ login: z.string(), avatar_url: z.string().nullish() });

const Installation = z.object({ id: z.int(), account: Account });

const Installed = z.object({ id: z.int(), account: z.string(), avatarUrl: z.string().nullable() });

export type GithubInstallation = z.output<typeof Installed>;

const installationOf = (item: z.output<typeof Installation>): GithubInstallation => ({
  id: item.id,
  account: item.account.login,
  avatarUrl: item.account.avatar_url ?? null,
});

/** The member's GitHub sign-in: a user token for the code GitHub sent back. */
export const userToken = async (app: GithubApp, code: string) => {
  const answer = await send(
    z.object({ access_token: z.string().min(1) }),
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      token: '',
      form: { client_id: app.clientId, client_secret: app.clientSecret, code },
    },
  );

  return answer.access_token;
};

/** The App's installations the signed-in GitHub user may manage: the proof they own them. */
export const userInstallations = async (token: string) =>
  (
    await send(
      z.object({ installations: z.array(Installation) }),
      `${API}/user/installations?per_page=100`,
      { token },
    )
  ).installations.map(installationOf);

export const signInUrl = (app: GithubApp, state: string) => {
  const url = new URL('https://github.com/login/oauth/authorize');

  url.searchParams.set('client_id', app.clientId);
  url.searchParams.set('state', state);

  return url.toString();
};

export const installUrl = (app: GithubApp, state: string) =>
  `https://github.com/apps/${encodeURIComponent(app.slug)}/installations/new?state=${encodeURIComponent(state)}`;

const signed = (body: string) =>
  hmacSha256(coreKey('erxes-github-app-ticket-v1'), body, 'base64url');

const Ticket = z.object({
  orgId: z.string(),
  userId: z.string(),
  installations: z.array(Installed),
  installUrl: z.string(),
  expiresAt: z.number(),
});

export type Ticket = z.output<typeof Ticket>;

/**
 * What the callback hands Settings: the installations the member proved they manage, signed so
 * connecting one needs no second sign-in. The body is readable JSON; only core can sign it.
 */
export const sealTicket = (ticket: Omit<Ticket, 'expiresAt'>) => {
  const body = base64url(
    JSON.stringify({ ...ticket, expiresAt: Date.now() + TICKET_MINUTES * 60_000 }),
  );

  return `${body}.${signed(body)}`;
};

export const openTicket = (token: string) => {
  const [body = '', signature = ''] = token.split('.');

  if (!safeEqual(signature, signed(body))) return null;

  const ticket = Ticket.safeParse(
    z.json().safeParse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))).data,
  );

  return ticket.success && ticket.data.expiresAt > Date.now() ? ticket.data : null;
};

const AccessToken = z.object({ token: z.string().min(1), expires_at: z.iso.datetime() });

/** A 1-hour installation token, minted with the App's JWT. */
export const installationToken = async (app: GithubApp, installationId: number) => {
  const answer = await send(
    AccessToken,
    `${API}/app/installations/${installationId}/access_tokens`,
    { method: 'POST', token: appJwt(app) },
  );

  return {
    accessToken: answer.token,
    expiresAt: Math.floor(new Date(answer.expires_at).getTime() / 1000),
  };
};

const Stored = z.object({
  installationId: z.number(),
  accessToken: z.string(),
  expiresAt: z.number(),
});

const stored = async (tx: Db, row: ConnectionRow) =>
  Stored.parse({ ...row.settings, ...JSON.parse(await readSecret(tx, row.secretId)) });

const fresh = (keys: z.output<typeof Stored>) =>
  keys.expiresAt - RENEW_MARGIN_SECONDS > Date.now() / 1000;

/**
 * An App connection's keys: its installation token, minted again when it is near expiry. The row
 * is locked while it renews, so concurrent calls mint once.
 */
export const installationKeys = async (tx: Db, row: ConnectionRow) => {
  const seen = await stored(tx, row);

  if (fresh(seen)) return { accessToken: seen.accessToken, installation: true as const };

  await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, row.id))
    .for('update');

  const current = await stored(tx, row);

  if (fresh(current)) return { accessToken: current.accessToken, installation: true as const };

  const next = await installationToken(await appIn(tx), current.installationId);

  await saveSecret(tx, JSON.stringify(next), row.secretId);

  return { accessToken: next.accessToken, installation: true as const };
};
