import {
  caller,
  type Db,
  integrationConnections,
  integrationOAuthApps,
  newId,
  requestOrgId,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256, randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink } from '~/modules/email/email';
import { readSecret, saveSecret } from '~/modules/secrets/vault';
import type { ConnectionRow } from './connections';
import {
  gatewayHttp,
  type OAuthKeys,
  oauthKeys,
  type OAuthSetup,
} from '@erxes/plugin-sdk/integrations';
import { connectable } from './connectable';
import { ensureNameFree } from './connectionNames';
import { type KeyedIntegration, sealedValues, splitValues } from './define';
import { metaRelayFor, withoutRelayPrefix } from './metaRelay';

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

export const SERVER_CLIENT = 'server';

type AppClient = Client & { ref: string };

const orgClient = async (tx: Db, key: string): Promise<AppClient | null> => {
  const [row] = await tx
    .select({ id: integrationOAuthApps.id, secretId: integrationOAuthApps.secretId })
    .from(integrationOAuthApps)
    .where(eq(integrationOAuthApps.key, key))
    .limit(1);

  return row
    ? { ref: row.id, ...Client.parse(JSON.parse(await readSecret(tx, row.secretId))) }
    : null;
};

const serverClient = (key: string): AppClient | null => {
  const client = config.integrations.oauthApps[key];

  return client ? { ref: SERVER_CLIENT, ...client } : null;
};

const clientSource = async (tx: Db, key: string) => {
  if (serverClient(key)) return 'server' as const;

  return (await orgClient(tx, key)) ? ('organization' as const) : null;
};

export const oauthFacts = async (tx: Db, key: string) => {
  const relay = metaRelayFor(key);

  return {
    client: await clientSource(tx, key),
    callbackUrl: relay?.redirectUrl ?? (await callbackUrl(tx)),
    serverClientId: serverClient(key)?.clientId ?? null,
    relayUrl: relay?.url ?? null,
  };
};

export const appClientOf = async (tx: Db, key: string) => serverClient(key) ?? orgClient(tx, key);

export const clientByRef = async (key: string, ref: string) => {
  if (ref === SERVER_CLIENT) {
    const client = serverClient(key);

    return client ? { ...client, orgId: null } : null;
  }

  const [row] = await withSystem('integration app lookup', (tx) =>
    tx
      .select({ orgId: integrationOAuthApps.orgId })
      .from(integrationOAuthApps)
      .where(and(eq(integrationOAuthApps.id, ref), eq(integrationOAuthApps.key, key)))
      .limit(1),
  );

  if (!row) return null;

  const client = await withOrg(row.orgId, (tx) => orgClient(tx, key));

  return client?.ref === ref ? { ...client, orgId: row.orgId } : null;
};

const callbackUrl = (tx: Db) => config.integrations.oauthCallbackUrl ?? appLink(tx, CALLBACK_PATH);

export const providerLink = (tx: Db, path: string) => {
  const fixed = config.integrations.oauthCallbackUrl;

  return fixed?.endsWith(CALLBACK_PATH)
    ? `${fixed.slice(0, -CALLBACK_PATH.length)}${path}`
    : appLink(tx, path);
};

const signed = (body: string) =>
  hmacSha256(coreKey('erxes-integration-oauth-state-v1'), body, 'base64url');

const verifierOf = (state: State) =>
  hmacSha256(coreKey('erxes-integration-oauth-pkce-v1'), state.nonce, 'base64url');

const sealState = (state: State) => {
  const body = Buffer.from(JSON.stringify(state)).toString('base64url');

  return `${body}.${signed(body)}`;
};

export const openState = (token: string) => {
  const [body = '', signature = ''] = withoutRelayPrefix(token).split('.');

  if (!safeEqual(signature, signed(body))) return null;

  const state = State.safeParse(
    z.json().safeParse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))).data,
  );

  return state.success && state.data.expiresAt > Date.now() ? state.data : null;
};

export const authorizeUrl = async (tx: Db, input: { key: string; name: string }) => {
  const integration = oauthOf(input.key);
  const client = await appClientOf(tx, integration.key);

  if (!client) throw fail('NOT_SET_UP', `Add your ${integration.name} app's client id and secret`);

  await ensureNameFree(tx, integration, input.name);

  const { oauth } = integration;

  const fields = {
    orgId: requestOrgId(),
    userId: caller('user').userId,
    key: integration.key,
    name: input.name,
    nonce: randomToken(24),
    expiresAt: Date.now() + STATE_MINUTES * 60_000,
  };

  const verifier = verifierOf(fields);
  const relay = metaRelayFor(integration.key);
  const callback = await callbackUrl(tx);

  const url = new URL(oauth.authorizeUrl);

  Object.entries({
    ...oauth.authorizeParams,
    client_id: client.clientId,
    redirect_uri: relay?.redirectUrl ?? callback,
    response_type: 'code',
    scope: oauth.scopes.join(oauth.scopeSeparator ?? ' '),
    state: relay ? `v1.${await relay.register(callback)}.${sealState(fields)}` : sealState(fields),
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

export const signInApp = async (tx: Db, key: string) => {
  const integration = oauthOf(key);
  const client = await appClientOf(tx, integration.key);

  if (!client) throw new Error(`${integration.name} has no OAuth app`);

  return {
    integration,
    client,
    redirectUri: metaRelayFor(integration.key)?.redirectUrl ?? (await callbackUrl(tx)),
  };
};

type SignInApp = Awaited<ReturnType<typeof signInApp>>;

export const exchangeCode = async (
  { integration, client, redirectUri }: SignInApp,
  state: State,
  code: string,
) => {
  const tokens = await requestTokens(integration, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: client.clientId,
    client_secret: client.clientSecret,
    code_verifier: verifierOf(state),
  });

  const lasting = await integration.oauth.longLived?.({
    accessToken: tokens.access_token,
    clientId: client.clientId,
    clientSecret: client.clientSecret,
  });

  const keys = keysFrom(
    lasting ? { access_token: lasting.accessToken, expires_in: lasting.expiresIn } : tokens,
  );

  const account = await integration.oauth.account(keys.accessToken);

  return { keys: { ...keys, account } };
};

const storedKeys = async (tx: Db, row: ConnectionRow): Promise<unknown> => ({
  ...row.settings,
  ...sealedValues(await readSecret(tx, row.secretId)),
});

const renewable = (keys: OAuthKeys): keys is OAuthKeys & { refreshToken: string } =>
  Boolean(
    keys.refreshToken &&
    keys.expiresAt &&
    keys.expiresAt - REFRESH_MARGIN_SECONDS < Date.now() / 1000,
  );

export const freshKeys = async (tx: Db, integration: KeyedIntegration, row: ConnectionRow) => {
  if (!isOAuth(integration)) return integration.keys.parse(await storedKeys(tx, row));

  const seen = oauthKeys.parse(await storedKeys(tx, row));

  if (!renewable(seen)) return seen;

  await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, row.id))
    .for('update');

  const current = oauthKeys.parse(await storedKeys(tx, row));

  if (!renewable(current)) return current;

  const client = await appClientOf(tx, integration.key);

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

  await saveSecret(tx, JSON.stringify(splitValues(integration.keys, next).secrets), row.secretId);

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

  await tx.delete(integrationOAuthApps).where(eq(integrationOAuthApps.key, integration.key));

  return { ok: true as const };
};
