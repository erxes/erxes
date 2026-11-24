import {
  type Caller,
  db,
  type Db,
  enterScope,
  pluginInstallations,
  plugins,
  roles,
  supportVisits,
  users,
  withOrg,
} from '@erxes/core-db';
import { and, eq, exists, sql } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { decodeProtectedHeader } from 'jose';
import { z } from 'zod';
import { readCookies, SESSION_COOKIE } from '~/http/cookies';
import { publicPaths, recordKeyDenial } from '~/http/access';
import { fail } from '~/http/errors';
import type { KeyDecision } from '@erxes/core-contract';
import { accessClaimsOf, renewSession } from '~/http/session';
import { verifyJwt } from '~/lib/signing';
import { apiKeyOfToken, isApiKey, markKeyUsed } from '~/modules/apiKeys/apiKeys.service';
import { keyCaller } from '~/modules/apiKeys/keyCaller';
import { requestedScopes } from '~/modules/plugins/requestedScopes';
import { livePortal } from '~/modules/customerAuth/customerPortals';
import { portalClaimsOfCall } from '~/modules/customerAuth/portalCalls';
import { customerOfToken } from '~/modules/customerAuth/customerSessions';
import { visitInProgress } from '~/modules/supportAccess/visits';

declare global {
  namespace Express {
    interface Request {
      /** The member token's session version (the live stream ends when it changes). */
      sessionVersion?: number;
    }
  }
}

const AUDIENCE = 'erxes-core';

const unauthorized = () => fail('UNAUTHORIZED', 'Sign in to continue');

/** Paths under /core/v1 that work without being signed in (public in the access map). */
const PUBLIC_PATHS = new Set([...publicPaths(), '/openapi.json', '/.well-known/jwks.json']);

/** JOSE `typ` of plugin access tokens (`POST /plugins/token`). */
export const PLUGIN_ACCESS_TYP = 'erxes-plugin-access+jwt';

/** Plugin tokens are ES256 JWTs with their own `typ`; member tokens are not. */
const isPluginToken = (token: string) => {
  try {
    return decodeProtectedHeader(token).typ === PLUGIN_ACCESS_TYP;
  } catch {
    // Not a JWT at all: the member token check rejects it.
    return false;
  }
};

/** Signed file links: the link itself is the permission. */
const isSignedFilePath = (path: string) => path.startsWith('/files/signed/');

/**
 * A cookie-signed change must come from erxes' own pages: browsers send the
 * cookie on cross-site requests too. Bearer-token calls are not affected.
 */
const isCrossSiteWrite = (req: Request) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return false;
  }

  const site = req.headers['sec-fetch-site'];

  if (site) {
    return site !== 'same-origin' && site !== 'none';
  }

  const origin = req.headers.origin;

  return Boolean(origin) && origin !== `${req.protocol}://${req.get('host')}`;
};

/**
 * The member a token names, if still active at the token's session version,
 * with their role's permissions. Role and status are read on every request,
 * so a disabled member or a role change applies at once. erxes support counts
 * only while their visit lasts: its end cuts off every session, key and app.
 */
export const memberOf = async (orgId: string, userId: string, sessionVersion?: number) => {
  const [user] = await withOrg(orgId, (tx) =>
    tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        canSignIn: users.canSignIn,
        sessionVersion: users.sessionVersion,
        permissions: roles.permissions,
        isSupport: users.isSupport,
        onVisit: sql<boolean>`${users.isSupport} and ${exists(
          tx
            .select({ id: supportVisits.id })
            .from(supportVisits)
            .where(and(eq(supportVisits.userId, users.id), visitInProgress)),
        )}`,
      })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(eq(users.id, userId))
      .limit(1),
  );

  // Disabled, kept on the team without sign-in, or the session predates a password change,
  // reset or sign-out everywhere.
  if (user?.status !== 'active' || !user.canSignIn) return null;

  if (sessionVersion !== undefined && user.sessionVersion !== sessionVersion) return null;

  if (user.isSupport && !user.onVisit) return null;

  return {
    type: 'user',
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
    ...(user.isSupport ? { support: true } : {}),
  } satisfies Caller;
};

interface Resolved {
  caller: Caller;
  orgId: string | null;
}

/**
 * A signed-in customer: their own routes only (`/portal/me`), with the token of the portal they
 * signed in to, while it still signs customers in.
 */
const resolveCustomer = async (req: Request, bearer: string): Promise<Resolved> => {
  const customer = bearer ? await customerOfToken(bearer) : null;

  if (!customer) throw unauthorized();

  // Core's portal API takes the portal's token too, for the portal the customer signed in to.
  const portal = await portalClaimsOfCall(req.get('x-portal-token'), req.get('origin'));

  // A portal that stopped signing customers in ends their sessions.
  if (
    portal.sub !== customer.portalId ||
    portal.org !== customer.orgId ||
    !(await livePortal(portal.sub))
  ) {
    throw unauthorized();
  }

  req.log.setBindings({ orgId: customer.orgId, customerId: customer.customerId });

  const { orgId, ...ids } = customer;

  return { caller: { type: 'customer', ...ids }, orgId };
};

type ApiKeyRow = NonNullable<Awaited<ReturnType<typeof apiKeyOfToken>>>;

/** Refuses the key's call and records why, as its maker. */
const refuseKey = async (key: ApiKeyRow, decision: KeyDecision) => {
  const maker: Caller = { type: 'user', userId: key.userId, role: 'api_key', permissions: [] };

  await enterScope(maker, key.orgId, () => recordKeyDenial(key.id, null, decision));

  return decision.rule === 'expired'
    ? unauthorized()
    : fail('KEY_NOT_ALLOWED', decision.reason, { rule: decision.rule });
};

/** A member key acts as the member, with their role as it is now (keys made before rules). */
const memberKeyCaller = async (key: ApiKeyRow) => {
  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
    throw await refuseKey(key, { allowed: false, rule: 'expired', reason: 'This key has expired' });
  }

  const member = await memberOf(key.orgId, key.userId);

  if (!member) throw unauthorized();

  return { ...member, apiKeyId: key.id };
};

/** The caller a key acts as, or its refusal (recorded on its own: `withOrgDetached`). */
const keyCallerOf = async (req: Request, tx: Db, key: ApiKeyRow): Promise<Caller> => {
  if (key.kind === 'member') return memberKeyCaller(key);

  const result = await keyCaller(tx, key, req.ip ?? null);

  if ('denied' in result) throw await refuseKey(key, result.denied);

  return result.caller;
};

/**
 * An API key: a member key, or a regular or management key with its rules. Its checks and
 * marking it used share one transaction of its organisation.
 */
const resolveApiKey = async (req: Request, token: string): Promise<Resolved> => {
  const key = await apiKeyOfToken(token);

  if (!key) throw unauthorized();

  const who = await withOrg(key.orgId, async (tx) => {
    const caller = await keyCallerOf(req, tx, key);

    await markKeyUsed(key.orgId, key.id);

    return caller;
  });

  req.log.setBindings({ orgId: key.orgId, actorId: key.userId, apiKeyId: key.id });

  return { caller: who, orgId: key.orgId };
};

const resolveMember = async (req: Request, res: Response, bearer: string): Promise<Resolved> => {
  const cookie = bearer ? '' : (readCookies(req.headers.cookie)[SESSION_COOKIE] ?? '');
  const token = bearer || cookie;

  if (!token) throw unauthorized();

  if (cookie && isCrossSiteWrite(req)) {
    throw fail('CROSS_SITE', 'Cross-site request blocked');
  }

  const claims = await accessClaimsOf(token);
  const member = claims && (await memberOf(claims.org, claims.sub, claims.sv));

  if (!claims || !member) throw unauthorized();

  if (cookie) await renewSession(req, res, claims);

  req.sessionVersion = claims.sv;
  req.log.setBindings({ orgId: claims.org, actorId: member.userId });

  return { caller: member, orgId: claims.org };
};

const PluginClaims = z.object({
  sub: z.string(),
  org: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * Scopes the owner granted after the token was issued that the plugin still asks for. Read
 * only when the installation grants more than the token carries, so most requests skip it.
 */
const grantedSince = async (plugin: string, granted: string[], carried: Set<string>) => {
  const newer = granted.filter((scope) => !carried.has(scope));

  if (newer.length === 0) return [];

  const [row] = await db()
    .select({ manifest: plugins.manifest })
    .from(plugins)
    .where(eq(plugins.name, plugin))
    .limit(1);

  const requested = new Set(row ? requestedScopes(row) : []);

  return newer.filter((scope) => requested.has(scope));
};

/**
 * A plugin token (`POST /plugins/token`), checked on every request against
 * the registry and the organisation's installation: disabling a plugin or
 * uninstalling it cuts it off at once, and a scope the owner approved after
 * the token was issued works at once. A token without an organisation is the
 * plugin's own (its manifest only).
 */
const resolvePlugin = async (req: Request, token: string): Promise<Resolved> => {
  const claims = await verifyJwt(token, PluginClaims, {
    typ: PLUGIN_ACCESS_TYP,
    audience: AUDIENCE,
  }).catch(() => null);

  if (!claims) throw unauthorized();

  const [plugin] = await db()
    .select({ status: plugins.status })
    .from(plugins)
    .where(eq(plugins.name, claims.sub))
    .limit(1);

  if (plugin?.status !== 'active') throw unauthorized();

  const { org } = claims;

  if (!org) {
    req.log.setBindings({ actorId: claims.sub });

    return { caller: { type: 'plugin', plugin: claims.sub, scopes: [] }, orgId: null };
  }

  const [installation] = await withOrg(org, (tx) =>
    tx
      .select({
        status: pluginInstallations.status,
        grantedScopes: pluginInstallations.grantedScopes,
      })
      .from(pluginInstallations)
      .where(eq(pluginInstallations.plugin, claims.sub))
      .limit(1),
  );

  if (installation?.status !== 'active') throw unauthorized();

  const granted = new Set(installation.grantedScopes);
  const carried = (claims.scope ?? '').split(' ').filter((scope) => granted.has(scope));
  const since = await grantedSince(claims.sub, installation.grantedScopes, new Set(carried));

  req.log.setBindings({ orgId: org, actorId: claims.sub });

  return {
    caller: {
      type: 'plugin',
      plugin: claims.sub,
      scopes: [...carried, ...since],
    },
    orgId: org,
  };
};

/**
 * Requires a valid access token (Bearer header, or the session cookie set at
 * sign-in) and runs the rest of the request with its caller and organisation
 * in scope (`caller()`, `scopedOrgId()` from `@erxes/core-db`).
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.has(req.path) || isSignedFilePath(req.path)) {
    return next();
  }

  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  // Nobody else's token works on the customer's own routes.
  const resolved = /^\/portal\/me(\/|$)/.test(req.path)
    ? await resolveCustomer(req, bearer)
    : bearer && isPluginToken(bearer)
      ? await resolvePlugin(req, bearer)
      : bearer && isApiKey(bearer)
        ? await resolveApiKey(req, bearer)
        : await resolveMember(req, res, bearer);

  enterScope(resolved.caller, resolved.orgId, next);
};

const AppTokenClaims = z.object({
  sub: z.string(),
  org: z.string(),
  sv: z.int(),
  client_id: z.string(),
});

/**
 * A caller of the MCP server at `resource`: an app's token for it (OAuth), acting as the member
 * while their session version holds, or an API key with its rules. Bearer only: a session cookie
 * never reaches the MCP server. Null for a token that isn't one; a refused key throws its refusal.
 */
export const mcpCallerOf = async (
  req: Request,
  bearer: string,
  resource: string,
): Promise<Resolved | null> => {
  if (isApiKey(bearer)) {
    const { caller, orgId } = await resolveApiKey(req, bearer);

    return { caller: caller.type === 'user' ? { ...caller, via: 'mcp' } : caller, orgId };
  }

  const claims = await verifyJwt(bearer, AppTokenClaims, {
    typ: 'at+jwt',
    audience: resource,
  }).catch(() => null);

  const member = claims && (await memberOf(claims.org, claims.sub, claims.sv));

  if (!claims || !member) return null;

  req.log.setBindings({ orgId: claims.org, actorId: member.userId, clientId: claims.client_id });

  return { caller: { ...member, via: 'mcp' }, orgId: claims.org };
};

/** Who a session cookie belongs to, if it is still valid (for sign-out). */
export const sessionClaims = async (
  req: Request,
): Promise<{ userId: string; orgId: string; sessionVersion: number } | null> => {
  const token = readCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!token) return null;

  const claims = await accessClaimsOf(token);

  return claims && { userId: claims.sub, orgId: claims.org, sessionVersion: claims.sv };
};
