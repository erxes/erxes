import { CORE_API_PREFIX, type CoreEvent, coreContract, type PluginManifest } from '@erxes/core-contract';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * For plugin servers (`hr`, `ecom`, …):
 *
 *   const core = createCoreClient({ coreUrl, plugin: 'hr', clientSecret });
 *   await core.registerManifest({ title: 'HR', version: '1.0.0', scopes: ['notifications:write'] });
 *   await core.forOrg(orgId).notifications.create({ userIds, kind: 'hr.leave.requested', title });
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *
 * Payments (scopes `payments:write`, `payments:read`; subscribe to `core.payment.*`):
 *
 *   const invoice = await core.forOrg(orgId).payments.createInvoice({
 *     amount: 150000, description: 'Order #12', reference: { type: 'order', id: order.id },
 *     metadata: { orderId: order.id }, dedupeKey: `order:${order.id}`,
 *   });                                   // show invoice.payment.qrImage / links to the payer
 *   app.post('/events', express.text({ type: '*\/*' }), async (req, res) => {
 *     const event = await verifyCoreEvent(req.headers.authorization, req.body, { coreUrl, plugin: 'ecom' });
 *     if (event.type === 'core.payment.paid') await markOrderPaid(event.data.payload.metadata.orderId);
 *     res.sendStatus(204);                // anything but 2xx is retried; handle each event id once
 *   });
 *   await core.forOrg(orgId).payments.refund({ id: invoice.id, reason: 'Out of stock' });
 *
 * Tiers on SaaS (erxes.io: free / plus / pro; self-hosted: pro, full):
 *
 *   const member = await verifyPluginSession(token, { coreUrl, plugin: 'hr' });
 *   if (member.tier === 'free' && employees >= 20) throw new Error('Upgrade to Plus for more employees');
 *   if (!member.canChange()) throw new Error('HR is read-only: buy it again on erxes.io');
 *   // server-side jobs: await core.forOrg(orgId).saas.pluginPlan() → { tier, access }
 *
 * The client secret is only ever sent to `POST /plugins/token`; API calls use
 * 15-minute tokens, fetched and renewed here. Plugins on core's database can
 * also call `core_publish_event()`, `core_record_audit()` and
 * `core_live_signal()` inside their own transactions.
 */

export type CoreClient = ContractRouterClient<typeof coreContract>;

export interface CoreClientOptions {
  /** Core's address, e.g. `https://acme.erxes.io` (without `/core/v1`). */
  coreUrl: string;
  plugin: string;
  clientSecret: string;
  fetch?: typeof globalThis.fetch;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class CoreTokenError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const createCoreClient = (options: CoreClientOptions) => {
  const fetcher = options.fetch ?? globalThis.fetch;
  const base = options.coreUrl.replace(/\/+$/, '');
  const tokens = new Map<string, Promise<CachedToken>>();

  const requestToken = async (org?: string): Promise<CachedToken> => {
    const response = await fetcher(`${base}${CORE_API_PREFIX}/plugins/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', client_id: options.plugin, client_secret: options.clientSecret, org }),
    });
    const body = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; code?: string; message?: string };

    if (!response.ok || !body.access_token) {
      throw new CoreTokenError(response.status, body.code ?? 'TOKEN_FAILED', body.message ?? 'Could not get a core token');
    }

    return { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 900) * 1000 };
  };

  /** A token for the organisation (or the deployment), renewed a minute before it ends. */
  const tokenFor = async (org?: string, fresh = false): Promise<string> => {
    const key = org ?? '';
    const cached = tokens.get(key);

    if (cached && !fresh) {
      const value = await cached.catch(() => null);

      if (value && value.expiresAt - Date.now() > 60_000) return value.token;
    }

    const request = requestToken(org);

    tokens.set(key, request);
    request.catch(() => tokens.delete(key));

    return (await request).token;
  };

  const clientFor = (org?: string): CoreClient =>
    createORPCClient(
      new OpenAPILink(coreContract, {
        url: `${base}${CORE_API_PREFIX}`,
        fetch: async (request, init) => {
          const send = async (token: string) => {
            const headers = new Headers(request.headers);

            headers.set('authorization', `Bearer ${token}`);

            return fetcher(new Request(request, { headers }), init);
          };
          const response = await send(await tokenFor(org));

          // Uninstalled and reinstalled, or scopes changed: try once with a new token.
          return response.status === 401 ? send(await tokenFor(org, true)) : response;
        },
      }),
    );

  const orgClients = new Map<string, CoreClient>();

  return {
    /** The core API acting in one organisation (that installed the plugin). */
    forOrg(orgId: string): CoreClient {
      let client = orgClients.get(orgId);

      if (!client) {
        client = clientFor(orgId);
        orgClients.set(orgId, client);
      }

      return client;
    },
    /** Declares the plugin's UI, API, scopes, permissions and events. Call at startup. */
    registerManifest: (manifest: PluginManifest) => clientFor().plugins.registerManifest(manifest),
    /** Tells the plugin's open UIs that topics changed (needs `live:write`). */
    signal: (orgId: string, topics: string[], userIds?: string[]) =>
      clientFor(orgId).plugins.signal({ topics, userIds }),
  };
};

/** The signed-in member a plugin UI calls the plugin's API for. */
export interface PluginMember {
  userId: string;
  orgId: string;
  /** `owner`, `admin`, `member` or a custom role key. */
  role: string;
  /** The member's actions in this plugin (from its manifest's `permissions`). */
  permissions: string[];
  /** `member.can('hr.leave.approve')` */
  can(action: string): boolean;
  /**
   * The plugin's tier in this organisation on erxes.io (`free`, `plus`,
   * `pro`): gate paid features with it. Self-hosted: `pro`.
   */
  tier: 'free' | 'plus' | 'pro' | null;
  /**
   * `full`, `warning` (payment retrying / ending at period end: still
   * works), `read_only` (left the plan: let them read and export, refuse
   * changes). Self-hosted: `full`.
   */
  access: 'full' | 'warning' | 'read_only' | 'off';
  /** `member.canChange()`: false while read-only. */
  canChange(): boolean;
}

const jwksByCore = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * Verifies a member's plugin session token (`Authorization: Bearer …` from
 * erxes-ui's `pluginFetch`) with core's public keys: issued by core, for this
 * plugin, unexpired. Throws if not.
 */
export const verifyPluginSession = async (
  token: string,
  options: { coreUrl: string; plugin: string },
): Promise<PluginMember> => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience: options.plugin,
    typ: 'erxes-plugin-session+jwt',
    algorithms: ['ES256'],
  });
  const { role, permissions } = payload;

  if (!payload.sub || typeof payload.org !== 'string' || typeof role !== 'string' || !Array.isArray(permissions)) {
    throw new Error('not an erxes plugin session');
  }

  const granted = new Set(permissions.filter((action): action is string => typeof action === 'string'));
  const tier = payload.tier === 'free' || payload.tier === 'plus' || payload.tier === 'pro' ? payload.tier : payload.tier === null ? null : 'pro';
  const access = payload.access === 'warning' || payload.access === 'read_only' || payload.access === 'off' ? payload.access : 'full';

  return {
    userId: payload.sub,
    orgId: payload.org,
    role,
    permissions: [...granted],
    can: (action: string) => role === 'owner' || granted.has(action),
    tier,
    access,
    canChange: () => access === 'full' || access === 'warning',
  };
};

/** The bearer token of a request's `Authorization` header, if any. */
export const bearerOf = (authorization: string | undefined | null) =>
  authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() || null : null;

/** Who is calling a plugin's automation action: core, for an automation's run. */
export interface CoreCall {
  orgId: string;
  /** The member the automation acts as. */
  userId: string;
  automationId: string;
  runId: string;
  stepId: string;
}

/**
 * Verifies the token core sends with an automation action
 * (`POST <api.url>/automations/actions/<type>`): issued by core, for this
 * plugin, unexpired. Use the `Idempotency-Key` header (`<run>:<step>`) to make
 * a retried call do nothing twice.
 */
export const verifyCoreCall = async (token: string, options: { coreUrl: string; plugin: string }): Promise<CoreCall> => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience: options.plugin,
    typ: 'erxes-core-call+jwt',
    algorithms: ['ES256'],
  });

  for (const key of ['org', 'user', 'automation', 'run', 'step'] as const) {
    if (typeof payload[key] !== 'string') throw new Error('not an erxes core call');
  }

  return {
    orgId: payload.org as string,
    userId: payload.user as string,
    automationId: payload.automation as string,
    runId: payload.run as string,
    stepId: payload.step as string,
  };
};

/** A member signed into a plugin's own app with "Sign in with erxes". */
export interface ErxesSignIn extends PluginMember {
  scope: string[];
}

/**
 * Verifies an access token from "Sign in with erxes" (OAuth 2.1, PKCE) for the
 * plugin's own app: issued by core, for this client (the plugin), unexpired.
 * Discovery: `<coreUrl>/core/v1/.well-known/openid-configuration`.
 */
export const verifyErxesAccessToken = async (token: string, options: { coreUrl: string; plugin: string }): Promise<ErxesSignIn> => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, { issuer: 'erxes-core', audience: options.plugin, typ: 'at+jwt', algorithms: ['ES256'] });
  const permissions = Array.isArray(payload.permissions) ? payload.permissions.filter((item): item is string => typeof item === 'string') : [];
  const role = typeof payload.role === 'string' ? payload.role : 'member';

  if (!payload.sub || typeof payload.org !== 'string') throw new Error('not an erxes access token');

  return {
    userId: payload.sub,
    orgId: payload.org,
    role,
    permissions,
    can: (action: string) => role === 'owner' || permissions.includes(action),
    // Not in these tokens: ask core (`saas.pluginPlan`) when the tier matters.
    tier: payload.tier === 'free' || payload.tier === 'plus' || payload.tier === 'pro' ? payload.tier : 'pro',
    access: payload.access === 'read_only' || payload.access === 'warning' || payload.access === 'off' ? payload.access : 'full',
    canChange: () => payload.access !== 'read_only' && payload.access !== 'off',
    scope: typeof payload.scope === 'string' ? payload.scope.split(' ') : [],
  };
};

/** An event core delivered to the plugin's `<api.url>/events` (from its manifest's `subscriptions`). */
export interface DeliveredEvent {
  id: string;
  type: string;
  organizationId: string;
  createdAt: string;
  data: CoreEvent;
}

const sha256 = async (text: string) => {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  let binary = '';

  for (const byte of digest) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Verifies an event delivery and returns the event: the `Authorization`
 * token is core's, for this plugin, unexpired, and signs this exact body
 * (pass the raw body text, not parsed JSON). Throws if anything is off.
 * Deliveries can repeat and arrive out of order: handle each `event.id`
 * once, and act on the totals in the payload, not on arrival order.
 */
export const verifyCoreEvent = async (
  authorization: string | undefined | null,
  rawBody: string,
  options: { coreUrl: string; plugin: string },
): Promise<DeliveredEvent> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience: options.plugin,
    typ: 'erxes-core-event+jwt',
    algorithms: ['ES256'],
  });

  if (payload.sha !== (await sha256(rawBody))) throw new Error('the body does not match the token');

  const event = JSON.parse(rawBody) as DeliveredEvent;

  if (event.id !== payload.event || event.organizationId !== payload.org) throw new Error('the event does not match the token');

  return event;
};
