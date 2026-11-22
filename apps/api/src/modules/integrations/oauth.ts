import {
  caller,
  type Db,
  integrationConnections,
  integrationOAuthApps,
  newId,
  requestOrgId,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256, randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink } from '~/modules/email/email';
import { readSecret, removeSecretAs, saveSecret } from '~/modules/secrets/vault';
import type { ConnectionRow } from './connections';
import { type KeyedIntegration, type OAuthKeys, oauthKeys, type OAuthSetup } from './define';
import { gatewayHttp } from './gateways/http';
import { connectable } from './connectable';

const STATE_MINUTES = 10;

const REFRESH_MARGIN_SECONDS = 60;

const CALLBACK_PATH = '/core/v1/integrations/oauth/callback';

const Client = z.object({ clientId: z.string().min(1), clientSecret: z.string().min(1) });

type Client = z.infer<typeof Client>;

const State = z.object({
  orgId: z.string(),
  userId: z.string(),
  key: z.string(),
  name: z.string(),
  nonce: z.string(),
  expiresAt: z.number(),
});

type State = z.infer<typeof State>;

const Tokens = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.coerce.number().positive().optional(),
});

type OAuthIntegration = KeyedIntegration & { oauth: OAuthSetup };

const isOAuth = (integration: KeyedIntegration): integration is OAuthIntegration =>
  Boolean(integration.oauth);

const oauthOf = (key: string) => {
  const integration = connectable(key);

  if (!isOAuth(integration)) throw fail('NOT_FOUND', `${integration.name} has no sign-in`);

  return integration;
};

const orgClient = async (tx: Db, key: string) => {
  const [row] = await tx
    .select({ secretId: integrationOAuthApps.secretId })
    .from(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, key))
    .limit(1);

  return row ? Client.parse(JSON.parse(await readSecret(tx, row.secretId))) : null;
};

export const oauthClientSource = async (tx: Db, key: string) => {
  if (config.integrations.oauthApps[key]) return 'server' as const;

  return (await orgClient(tx, key)) ? ('organization' as const) : null;
};

const clientOf = async (tx: Db, key: string): Promise<Client | null> =>
  config.integrations.oauthApps[key] ?? (await orgClient(tx, key));

export const callbackUrl = (tx: Db) =>
  config.integrations.oauthCallbackUrl ?? appLink(tx, CALLBACK_PATH);

const signed = (body: string) =>
  hmacSha256(coreKey('erxes-integration-oauth-state-v1'), body, 'base64url');

const verifierOf = (state: State) =>
  hmacSha256(coreKey('erxes-integration-oauth-pkce-v1'), state.nonce, 'base64url');

const sealState = (state: State) => {
  const body = Buffer.from(JSON.stringify(state)).toString('base64url');

  return `${body}.${signed(body)}`;
};

export const openState = (token: string) => {
  const [body = '', signature = ''] = token.split('.');

  if (!safeEqual(signature, signed(body))) return null;

  const state = State.safeParse(
    z.json().safeParse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))).data,
  );

  return state.success && state.data.expiresAt > Date.now() ? state.data : null;
};

export const authorizeUrl = async (tx: Db, input: { key: string; name: string }) => {
  const integration = oauthOf(input.key);
  const client = await clientOf(tx, integration.key);

  if (!client) throw fail('NOT_SET_UP', `Add your ${integration.name} app's client id and secret`);

  const { oauth } = integration;

  const fields = {
    orgId: requestOrgId(),
    userId: caller('user').userId,
    key: integration.key,
    name: input.name,
    nonce: randomToken(24),
    expiresAt: Date.now() + STATE_MINUTES * 60_000,
  };

  const state = sealState(fields);
  const verifier = verifierOf(fields);

  const url = new URL(oauth.authorizeUrl);

  Object.entries({
    ...oauth.authorizeParams,
    client_id: client.clientId,
    redirect_uri: await callbackUrl(tx),
    response_type: 'code',
    scope: oauth.scopes.join(oauth.scopeSeparator ?? ' '),
    state,
    code_challenge: sha256(verifier, 'base64url'),
    code_challenge_method: 'S256',
  }).forEach(([name, value]) => url.searchParams.set(name, value));

  return { url: url.toString() };
};

const requestTokens = async (integration: OAuthIntegration, form: Record<string, string>) => {
  const send = gatewayHttp(integration.name, '', {});

  const text = await send(integration.oauth.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form).toString(),
  });

  const tokens = Tokens.safeParse(JSON.parse(text));

  if (!tokens.success) throw new Error(`${integration.name} gave no access token`);

  return tokens.data;
};

const keysFrom = (tokens: z.infer<typeof Tokens>, before?: OAuthKeys): OAuthKeys => ({
  ...before,
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token ?? before?.refreshToken,
  expiresAt: tokens.expires_in
    ? Math.floor(Date.now() / 1000 + tokens.expires_in)
    : before?.expiresAt,
});

export const exchangeCode = async (tx: Db, state: State, code: string) => {
  const integration = oauthOf(state.key);
  const client = await clientOf(tx, integration.key);

  if (!client) throw new Error(`${integration.name} has no OAuth app`);

  const tokens = await requestTokens(integration, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: await callbackUrl(tx),
    client_id: client.clientId,
    client_secret: client.clientSecret,
    code_verifier: verifierOf(state),
  });

  const keys = keysFrom(tokens);
  const account = await integration.oauth.account(keys.accessToken);

  return { integration, keys: { ...keys, account } };
};

export const freshKeys = async (tx: Db, integration: KeyedIntegration, row: ConnectionRow) => {
  const keys: unknown = JSON.parse(await readSecret(tx, row.secretId));

  if (!isOAuth(integration)) return integration.keys.parse(keys);

  const current = oauthKeys.parse(keys);
  const due = current.expiresAt && current.expiresAt - REFRESH_MARGIN_SECONDS < Date.now() / 1000;

  if (!due || !current.refreshToken) return current;

  await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, row.id))
    .for('update');

  const client = await clientOf(tx, integration.key);

  if (!client) throw new Error(`${integration.name} has no OAuth app to renew its sign-in`);

  const next = keysFrom(
    await requestTokens(integration, {
      grant_type: 'refresh_token',
      refresh_token: current.refreshToken,
      client_id: client.clientId,
      client_secret: client.clientSecret,
    }),
    current,
  );

  await saveSecret(tx, JSON.stringify(next), row.secretId);

  return next;
};

export const setOAuthApp = async (tx: Db, input: { key: string } & Client) => {
  const integration = oauthOf(input.key);

  const [row] = await tx
    .select({ secretId: integrationOAuthApps.secretId })
    .from(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, integration.key))
    .limit(1);

  const value = JSON.stringify(Client.parse(input));

  if (row) {
    await saveSecret(tx, value, row.secretId);
    await tx
      .update(integrationOAuthApps)
      .set({ updatedAt: sql`now()` })
      .where(eq(integrationOAuthApps.key, integration.key));
  } else {
    await tx.insert(integrationOAuthApps).values({
      id: newId(),
      key: integration.key,
      secretId: await saveSecret(tx, value),
      createdBy: caller('user').userId,
    });
  }

  await recordAudit(tx, {
    action: 'integration.oauth_app_set',
    targetType: 'integration',
    targetId: integration.key,
    targetLabel: integration.name,
    metadata: { clientId: input.clientId },
  });

  return { ok: true as const };
};

export const removeOAuthApp = async (tx: Db, key: string) => {
  const integration = oauthOf(key);

  const [row] = await tx
    .delete(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, integration.key))
    .returning({ secretId: integrationOAuthApps.secretId });

  if (row) await removeSecretAs(tx, 'core', row.secretId);

  return { ok: true as const };
};
