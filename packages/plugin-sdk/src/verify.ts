import {
  CORE_API_PREFIX,
  CoreEvent,
  PluginAccess,
  PluginJobDelivery,
  PluginTier,
  RecordAccessCheck,
} from '@erxes/core-contract';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

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
  tier: PluginTier | null;
  /**
   * `full`, `warning` (payment retrying / ending at period end: still
   * works), `read_only` (left the plan: let them read and export, refuse
   * changes). Self-hosted: `full`.
   */
  access: PluginAccess;
  /** `member.canChange()`: false while read-only. */
  canChange(): boolean;
}

/**
 * A member signed into a plugin's own app with "Sign in with erxes". Access
 * tokens carry no plan, so `tier` is null and `access` is `off`: ask core
 * (`saas.pluginPlan`) before gating on them.
 */
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
  // The JSON body carries ISO strings, where `CoreEvent` reads the row's dates.
  data: CoreEvent.extend({ occurredAt: z.iso.datetime(), createdAt: z.iso.datetime() }),
});

export type DeliveredEvent = z.infer<typeof DeliveredEvent>;

interface VerifyOptions {
  coreUrl: string;
  plugin: string;
}

const jwksByCore = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * The plugin's server clock may run a little ahead of core's: a token core
 * just issued, or one a member's browser renews 30 s before it ends, still passes.
 */
const CLOCK_TOLERANCE_SECONDS = 60;

/** A token core signed (its public keys), for this plugin (or `audience`), of this kind, unexpired; its claims parsed. */
const verifyCoreToken = async <T>(
  token: string,
  options: Pick<VerifyOptions, 'coreUrl'> & { plugin?: string },
  typ: string,
  claims: z.ZodType<T>,
  audience = options.plugin,
) => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  if (!audience) throw new Error('no audience to check the token for');

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience,
    typ,
    algorithms: ['ES256'],
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
  });

  const parsed = claims.safeParse(payload);

  if (!parsed.success) throw new Error(`not an erxes ${typ} token`);

  return parsed.data;
};

// A claim of the wrong type or an unknown value fails verification: it never grants access.
const Tier = PluginTier.nullable();

const member = (claims: {
  sub: string;
  org: string;
  role: string;
  permissions: string[];
  tier: PluginMember['tier'];
  access: PluginMember['access'];
}): PluginMember => ({
  userId: claims.sub,
  orgId: claims.org,
  role: claims.role,
  permissions: claims.permissions,
  can: (action) => claims.role === 'owner' || claims.permissions.includes(action),
  tier: claims.tier,
  access: claims.access,
  canChange: () => claims.access === 'full' || claims.access === 'warning',
});

const SessionClaims = z.object({
  sub: z.string().min(1),
  org: z.string(),
  role: z.string(),
  permissions: z.array(z.string()),
  // Core signs both (self-hosted: `pro` and `full`); null means no plan.
  tier: Tier,
  access: PluginAccess,
});

/**
 * Verifies a member's plugin session token (`Authorization: Bearer …` from
 * erxes-ui's `pluginFetch`) with core's public keys: issued by core, for this
 * plugin, unexpired. Throws if not.
 */
export const verifyPluginSession = async (token: string, options: VerifyOptions) =>
  member(await verifyCoreToken(token, options, 'erxes-plugin-session+jwt', SessionClaims));

/**
 * Another plugin reading this plugin's API for an organisation (its manifest's `pluginReads`,
 * approved by the owner). It passes for a member: `userId` is `plugin:<name>`, `role` `plugin`,
 * and `can()` holds only for the approved permissions, so `reads(...)` procedures serve it as they
 * are.
 */
export interface PluginCall extends PluginMember {
  /** The calling plugin (`accounting`). */
  plugin: string;
}

const PluginCallClaims = z.object({
  sub: z.string().startsWith('plugin:'),
  org: z.string().min(1),
  plugin: z.string().min(1),
  permissions: z.array(z.string()),
  tier: Tier,
  access: PluginAccess,
});

/**
 * Verifies a token core issued for another plugin to call this plugin's API (`Authorization:
 * Bearer …` from `core.fetchPlugin`): issued by core, for this plugin, unexpired (5 minutes).
 * Throws if not.
 */
export const verifyPluginCall = async (
  token: string,
  options: VerifyOptions,
): Promise<PluginCall> => {
  const claims = await verifyCoreToken(token, options, 'erxes-plugin-call+jwt', PluginCallClaims);

  if (claims.sub !== `plugin:${claims.plugin}`) throw new Error('not an erxes plugin call token');

  return { ...member({ ...claims, role: 'plugin' }), plugin: claims.plugin };
};

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
  role: z.string(),
  permissions: z.array(z.string()),
  // Core doesn't sign these into access tokens, so they read as no plan and
  // no access: ask core (`saas.pluginPlan`) when the plan matters.
  tier: Tier.default(null),
  access: PluginAccess.default('off'),
  scope: z.string().transform((scope) => scope.split(' ')),
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

/** A customer signed in through core (`/customer-auth`), calling a plugin's `/customer/*` routes. */
export interface CustomerSignIn {
  orgId: string;
  customerId: string;
  /** The plugin whose app the customer signed in to (any app of the organisation may call). */
  clientId: string;
}

const CustomerClaims = z
  .object({ sub: z.string().min(1), org: z.string().min(1), client_id: z.string() })
  .transform((claims): CustomerSignIn => ({
    orgId: claims.org,
    customerId: claims.sub,
    clientId: claims.client_id,
  }));

/**
 * Verifies a customer's access token from the `Authorization` header with
 * core's public keys: issued by core for customers, unexpired. Key the
 * customer's data by `orgId` and `customerId`. Signing out reaches plugins
 * when the token expires (15 minutes); ask core (`GET /customer/me` with the
 * same token) where that matters. Throws if not valid.
 */
export const verifyCustomerToken = async (
  authorization: string | undefined | null,
  options: { coreUrl: string },
): Promise<CustomerSignIn> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no customer token');

  return verifyCoreToken(token, options, 'customer+jwt', CustomerClaims, 'erxes-customer');
};

/** A body's SHA-256, base64url: text as UTF-8, or its bytes as they came. */
const sha256 = async (body: string | Uint8Array<ArrayBuffer>) => {
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      typeof body === 'string' ? new TextEncoder().encode(body) : body,
    ),
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

/** A call from outside erxes that core forwarded to the plugin's `/public` route. */
export interface PublicCall {
  /** The organisation the caller's address named, which has the plugin installed. */
  orgId: string;
  /** Core's id for this call. */
  callId: string;
}

const PublicClaims = z.object({ sha: z.string(), public: z.string(), org: z.string() });

/**
 * Verifies a call core forwarded to `<api.url>/public/<path>` (one of the manifest's
 * `publicPaths`) and returns its organisation: the token is core's, for this plugin, at most a
 * minute old, and signs this exact body (its raw text, or its bytes from `express.raw` for one
 * that isn't text; '' without one). Throws if not. The caller is anyone on the internet: check
 * what they send (a webhook's signature).
 */
export const verifyPublicCall = async (
  authorization: string | undefined | null,
  rawBody: string | Uint8Array<ArrayBuffer>,
  options: VerifyOptions,
): Promise<PublicCall> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const claims = await verifyCoreToken(token, options, 'erxes-core-public+jwt', PublicClaims);

  if (claims.sha !== (await sha256(rawBody))) throw new Error('the body does not match the token');

  return { orgId: claims.org, callId: claims.public };
};

const JobClaims = z.object({ sha: z.string(), job: z.string(), org: z.string() });

/**
 * Verifies one attempt of a job core POSTed to `<api.url>/jobs/<name>` and
 * returns it: the token is core's, for this plugin, unexpired, and signs this
 * exact body (pass the raw body text). Throws if anything is off. Answer 2xx
 * when done; anything else retries. A job can run more than once: the
 * `Idempotency-Key` header is its `jobId`.
 */
export const verifyCoreJob = async (
  authorization: string | undefined | null,
  rawBody: string,
  options: VerifyOptions,
): Promise<PluginJobDelivery> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const claims = await verifyCoreToken(token, options, 'erxes-core-job+jwt', JobClaims);

  if (claims.sha !== (await sha256(rawBody))) throw new Error('the body does not match the token');

  const job = PluginJobDelivery.parse(JSON.parse(rawBody));

  if (job.jobId !== claims.job || job.orgId !== claims.org)
    throw new Error('the job does not match the token');

  return job;
};

const AccessClaims = z.object({ sha: z.string(), access: z.string(), org: z.string() });

/**
 * Verifies core's question for a timeline with `recordAccess` (`POST <api.url>/timelines/access`)
 * and returns it: may `userId` read record `id` of timeline `type`? The token is core's, for this
 * plugin, unexpired, and signs this exact body (pass the raw body text). Answer
 * `{ "allowed": true }` or `{ "allowed": false }` within 5 seconds; anything else is no.
 */
export const verifyCoreAccessCheck = async (
  authorization: string | undefined | null,
  rawBody: string,
  options: VerifyOptions,
): Promise<RecordAccessCheck> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const claims = await verifyCoreToken(token, options, 'erxes-core-access+jwt', AccessClaims);

  if (claims.sha !== (await sha256(rawBody))) throw new Error('the body does not match the token');

  const check = RecordAccessCheck.parse(JSON.parse(rawBody));

  if (check.orgId !== claims.org) throw new Error('the check does not match the token');

  return check;
};
