import {
  type Caller,
  db,
  enterScope,
  pluginInstallations,
  plugins,
  roles,
  users,
  withOrg,
} from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { decodeProtectedHeader, jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { readCookies, SESSION_COOKIE } from '~/http/cookies';
import { publicPaths } from '~/http/access';
import { HttpError } from '~/http/errors';
import { verifyJwt } from '~/lib/signing';
import { appServes } from '~/modules/customerAuth/customerApps';
import { customerOfToken } from '~/modules/customerAuth/customerSessions';

declare global {
  namespace Express {
    interface Request {
      /** The member token's session version (the live stream ends when it changes). */
      sessionVersion?: number;
    }
  }
}

const AccessClaims = z.object({
  typ: z.literal('core_access'),
  sub: z.string().min(1),
  org: z.string().min(1),
  /** The member's session version when it was issued (see `users.sessionVersion`). */
  sv: z.number(),
});

const AUDIENCE = 'erxes-core';

const accessSecret = () => new TextEncoder().encode(config.auth.jwtSecret);

/** Core access token (HS256, core's own secret). */
export const signAccessToken = (
  userId: string,
  orgId: string,
  ttlSeconds = config.auth.accessTokenTtlSeconds,
  sessionVersion = 1,
): Promise<string> =>
  new SignJWT({ typ: 'core_access', org: orgId, sv: sessionVersion })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(accessSecret());

/** The claims of a valid member token; null for an expired, forged or foreign one. */
const accessClaimsOf = async (token: string) => {
  const verified = await jwtVerify(token, accessSecret(), {
    algorithms: ['HS256'],
    audience: AUDIENCE,
  }).catch(() => null);

  return AccessClaims.safeParse(verified?.payload).data ?? null;
};

const unauthorized = () => new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

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
 * so a disabled member or a role change applies at once.
 */
export const memberOf = async (orgId: string, userId: string, sessionVersion?: number) => {
  const [user] = await withOrg(orgId, (tx) =>
    tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        sessionVersion: users.sessionVersion,
        permissions: roles.permissions,
      })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(eq(users.id, userId))
      .limit(1),
  );

  // Disabled, or the session predates a password change, reset or sign-out everywhere.
  if (user?.status !== 'active') return null;

  if (sessionVersion !== undefined && user.sessionVersion !== sessionVersion) return null;

  return {
    type: 'user',
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
  } satisfies Caller;
};

interface Resolved {
  caller: Caller;
  orgId: string | null;
}

/** A signed-in customer: their own routes only, from an app that still serves the organisation. */
const resolveCustomer = async (req: Request, bearer: string): Promise<Resolved> => {
  const customer = bearer ? await customerOfToken(bearer) : null;

  if (!customer || !(await appServes(customer.clientId, customer.orgId, req.get('origin')))) {
    throw unauthorized();
  }

  req.log.setBindings({ orgId: customer.orgId, customerId: customer.customerId });

  const { orgId, ...ids } = customer;

  return { caller: { type: 'customer', ...ids }, orgId };
};

const resolveMember = async (req: Request, bearer: string): Promise<Resolved> => {
  const cookie = bearer ? '' : (readCookies(req.headers.cookie)[SESSION_COOKIE] ?? '');
  const token = bearer || cookie;

  if (!token) throw unauthorized();

  if (cookie && isCrossSiteWrite(req)) {
    throw new HttpError(403, 'CROSS_SITE', 'Cross-site request blocked');
  }

  const claims = await accessClaimsOf(token);
  const member = claims && (await memberOf(claims.org, claims.sub, claims.sv));

  if (!claims || !member) throw unauthorized();

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
 * A plugin token (`POST /plugins/token`), checked on every request against
 * the registry and the organisation's installation: disabling a plugin or
 * uninstalling it cuts it off at once, and scopes can only shrink. A token
 * without an organisation is the plugin's own (its manifest only).
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

  req.log.setBindings({ orgId: org, actorId: claims.sub });

  return {
    caller: {
      type: 'plugin',
      plugin: claims.sub,
      scopes: (claims.scope ?? '').split(' ').filter((scope) => granted.has(scope)),
    },
    orgId: org,
  };
};

/**
 * Requires a valid access token (Bearer header, or the session cookie set at
 * sign-in) and runs the rest of the request with its caller and organisation
 * in scope (`caller()`, `scopedOrgId()` from `@erxes/core-db`).
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.has(req.path) || isSignedFilePath(req.path)) {
    return next();
  }

  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  // Nobody else's token works on the customer routes.
  const resolved = req.path.startsWith('/customer/')
    ? await resolveCustomer(req, bearer)
    : bearer && isPluginToken(bearer)
      ? await resolvePlugin(req, bearer)
      : await resolveMember(req, bearer);

  enterScope(resolved.caller, resolved.orgId, next);
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
