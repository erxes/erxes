import { CORE_API_PREFIX, CoreEvent } from '@erxes/core-contract';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

/** The signed-in member a plugin UI calls the plugin's API for. */
export interface PluginMember {
  userId: string;
  orgId: string;
  /** The member's sign-in email and display name (null in tokens without them). */
  email: string | null;
  name: string | null;
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

/** A member signed into a plugin's own app with "Sign in with erxes". */
export interface ErxesSignIn extends PluginMember {
  scope: string[];
}

/** Who is calling a plugin's automation action: core, for an automation's run. */
export interface CoreCall {
  orgId: string;
  /** The member the automation acts as. */
  userId: string;
  automationId: string;
  runId: string;
  stepId: string;
}

/** An event core delivered to the plugin's `<api.url>/events` (from its manifest's `subscriptions`). */
export const DeliveredEvent = z.object({
  id: z.string(),
  type: z.string(),
  organizationId: z.string(),
  createdAt: z.string(),
  data: CoreEvent,
});

export type DeliveredEvent = z.infer<typeof DeliveredEvent>;

interface VerifyOptions {
  coreUrl: string;
  plugin: string;
}

const jwksByCore = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/** A token core signed (its public keys), for this plugin, of this kind, unexpired; its claims parsed. */
const verifyCoreToken = async <T>(
  token: string,
  options: VerifyOptions,
  typ: string,
  claims: z.ZodType<T>,
) => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience: options.plugin,
    typ,
    algorithms: ['ES256'],
  });

  const parsed = claims.safeParse(payload);

  if (!parsed.success) throw new Error(`not an erxes ${typ} token`);

  return parsed.data;
};

const Tier = z.enum(['free', 'plus', 'pro']);
const Access = z.enum(['full', 'warning', 'read_only', 'off']);

const Strings = z
  .array(z.unknown())
  .transform((items) => items.filter((item): item is string => typeof item === 'string'));

const member = (claims: {
  sub: string;
  org: string;
  email: string | null;
  name: string | null;
  role: string;
  permissions: string[];
  tier: PluginMember['tier'];
  access: PluginMember['access'];
}): PluginMember => ({
  userId: claims.sub,
  orgId: claims.org,
  email: claims.email,
  name: claims.name,
  role: claims.role,
  permissions: claims.permissions,
  can: (action) => claims.role === 'owner' || claims.permissions.includes(action),
  tier: claims.tier,
  access: claims.access,
  canChange: () => claims.access === 'full' || claims.access === 'warning',
});

const Text = z.string().nullable().catch(null);

const SessionClaims = z.object({
  sub: z.string().min(1),
  org: z.string(),
  email: Text,
  name: Text,
  role: z.string(),
  permissions: Strings,
  // Absent or unknown means self-hosted: pro; null means no plan.
  tier: z.union([Tier, z.null()]).catch('pro'),
  access: Access.catch('full'),
});

/**
 * Verifies a member's plugin session token (`Authorization: Bearer …` from
 * erxes-ui's `pluginFetch`) with core's public keys: issued by core, for this
 * plugin, unexpired. Throws if not.
 */
export const verifyPluginSession = async (token: string, options: VerifyOptions) =>
  member(await verifyCoreToken(token, options, 'erxes-plugin-session+jwt', SessionClaims));

const OrgClaims = z.object({ org: z.string().min(1) });

/**
 * The organisation a request core forwarded from `/pl:<plugin>/…` is for,
 * from its `x-erxes-org` header (`PLUGIN_ORG_HEADER`): the signed-in member's,
 * or for visitors (careers pages, a mobile app with the plugin's own tokens)
 * the one whose address they opened. Throws when core didn't sign it for this plugin.
 */
export const verifyPluginOrg = async (token: string, options: VerifyOptions) =>
  (await verifyCoreToken(token, options, 'erxes-plugin-org+jwt', OrgClaims)).org;

/** The bearer token of a request's `Authorization` header, if any. */
export const bearerOf = (authorization: string | undefined | null) =>
  authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() || null : null;

const CallClaims = z
  .object({
    org: z.string(),
    user: z.string(),
    automation: z.string(),
    run: z.string(),
    step: z.string(),
  })
  .transform((claims): CoreCall => ({
    orgId: claims.org,
    userId: claims.user,
    automationId: claims.automation,
    runId: claims.run,
    stepId: claims.step,
  }));

/**
 * Verifies the token core sends with an automation action
 * (`POST <api.url>/automations/actions/<type>`): issued by core, for this
 * plugin, unexpired. A retried call carries the same `Idempotency-Key` header
 * (`<run>:<step>`): record it with the action's effect so a retry does nothing twice.
 */
export const verifyCoreCall = (token: string, options: VerifyOptions): Promise<CoreCall> =>
  verifyCoreToken(token, options, 'erxes-core-call+jwt', CallClaims);

const AccessTokenClaims = z.object({
  sub: z.string().min(1),
  org: z.string(),
  email: Text,
  name: Text,
  role: z.string().catch('member'),
  permissions: Strings.catch([]),
  // Not in these tokens: ask core (`saas.pluginPlan`) when the tier matters.
  tier: Tier.catch('pro'),
  access: Access.catch('full'),
  scope: z
    .string()
    .transform((scope) => scope.split(' '))
    .catch([]),
});

/**
 * Verifies an access token from "Sign in with erxes" (OAuth 2.1, PKCE) for the
 * plugin's own app: issued by core, for this client (the plugin), unexpired.
 * Discovery: `<coreUrl>/core/v1/.well-known/openid-configuration`.
 */
export const verifyErxesAccessToken = async (
  token: string,
  options: VerifyOptions,
): Promise<ErxesSignIn> => {
  const claims = await verifyCoreToken(token, options, 'at+jwt', AccessTokenClaims);

  return { ...member(claims), scope: claims.scope };
};

const sha256 = async (text: string) => {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)),
  );

  return btoa(String.fromCharCode(...digest))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const EventClaims = z.object({ sha: z.string(), event: z.string(), org: z.string() });

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
  options: VerifyOptions,
): Promise<DeliveredEvent> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const claims = await verifyCoreToken(token, options, 'erxes-core-event+jwt', EventClaims);

  if (claims.sha !== (await sha256(rawBody))) throw new Error('the body does not match the token');

  const event = DeliveredEvent.parse(JSON.parse(rawBody));

  if (event.id !== claims.event || event.organizationId !== claims.org)
    throw new Error('the event does not match the token');

  return event;
};
