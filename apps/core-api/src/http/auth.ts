import { db, organizations, users } from '@erxes/core-db';
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '~/config';
import { readCookies, SESSION_COOKIE } from '~/http/cookies';
import { HttpError } from '~/http/errors';

export type Role = 'owner' | 'admin' | 'member';

/** Who is calling, resolved from the access token on every request. */
export interface Actor {
  userId: string;
  orgId: string;
  role: Role;
}

/** A plugin calling core with its key, for one organisation. */
export interface PluginCaller {
  plugin: string;
  orgId: string;
}

/**
 * Whoever is calling, as recorded in audit, activity and notifications:
 * a team member or a plugin. `source` is `core` for members, else the plugin.
 */
export interface Caller {
  orgId: string;
  actorType: 'user' | 'plugin';
  actorId: string;
  source: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: Actor;
      plugin?: PluginCaller;
    }
  }
}

export const userCaller = (actor: Actor): Caller => ({
  orgId: actor.orgId,
  actorType: 'user',
  actorId: actor.userId,
  source: 'core',
});

export const pluginCaller = (plugin: PluginCaller): Caller => ({
  orgId: plugin.orgId,
  actorType: 'plugin',
  actorId: plugin.plugin,
  source: plugin.plugin,
});

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/** Plugin keys by their SHA-256, so a lookup does not compare secrets directly. */
const pluginKeys = new Map([...config.pluginKeys].map(([secret, name]) => [sha256(secret), name]));

const ORG_HEADER = 'x-erxes-org';

export const isManager = (actor: Actor) => actor.role === 'owner' || actor.role === 'admin';

/** Owners and admins only. */
export const requireManager = (actor: Actor, message: string) => {
  if (!isManager(actor)) {
    throw new HttpError(403, 'NOT_ALLOWED', message);
  }
};

interface AccessClaims {
  typ: 'core_access';
  sub: string;
  org: string;
}

const AUDIENCE = 'erxes-core';

/**
 * Core access token. HS256 for now; the sign-in slice moves core to RS256
 * keys published as JWKS (ported from the old core's OAuth server).
 */
export const signAccessToken = (
  userId: string,
  orgId: string,
  ttlSeconds = config.auth.accessTokenTtlSeconds,
): string =>
  jwt.sign({ typ: 'core_access', org: orgId }, config.auth.jwtSecret, {
    algorithm: 'HS256',
    subject: userId,
    audience: AUDIENCE,
    expiresIn: ttlSeconds,
  });

const verifyAccessToken = (token: string): AccessClaims => {
  const claims = jwt.verify(token, config.auth.jwtSecret, {
    algorithms: ['HS256'],
    audience: AUDIENCE,
  }) as Partial<AccessClaims>;

  if (claims.typ !== 'core_access' || !claims.sub || !claims.org) {
    throw new Error('not a core access token');
  }

  return claims as AccessClaims;
};

const unauthorized = () =>
  new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

/** Paths under /core/v1 that work without being signed in. */
const PUBLIC_PATHS = new Set(['/auth/sign-in', '/auth/sign-out', '/setup', '/openapi.json']);

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
 * Requires a valid access token (Bearer header, or the session cookie set at
 * sign-in) whose user is still active in the token's organisation. Role and
 * status are read from the database, so a disabled member or a role change
 * applies on the next request.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.has(req.path) || isSignedFilePath(req.path)) {
    return next();
  }

  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const plugin = bearer ? pluginKeys.get(sha256(bearer)) : undefined;

  if (plugin) {
    return authenticatePlugin(req, plugin, next);
  }
  const cookie = bearer ? '' : readCookies(req.headers.cookie)[SESSION_COOKIE] ?? '';
  const token = bearer || cookie;

  if (!token) {
    return next(unauthorized());
  }

  if (cookie && isCrossSiteWrite(req)) {
    return next(new HttpError(403, 'CROSS_SITE', 'Cross-site request blocked'));
  }

  let claims: AccessClaims;

  try {
    claims = verifyAccessToken(token);
  } catch {
    return next(unauthorized());
  }

  db()
    .select({ id: users.id, orgId: users.orgId, role: users.role, status: users.status })
    .from(users)
    .where(and(eq(users.id, claims.sub), eq(users.orgId, claims.org)))
    .limit(1)
    .then(([user]) => {
      if (!user || user.status !== 'active') {
        return next(unauthorized());
      }

      req.actor = { userId: user.id, orgId: user.orgId, role: user.role };
      return next();
    })
    .catch(next);
};

/** A plugin key names the plugin; `X-Erxes-Org` the organisation it acts for. */
const authenticatePlugin = (req: Request, plugin: string, next: NextFunction) => {
  const orgId = req.get(ORG_HEADER)?.trim();

  if (!orgId) {
    return next(new HttpError(400, 'ORG_REQUIRED', 'Plugin calls must name the organisation (X-Erxes-Org)'));
  }

  db()
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1)
    .then(([organization]) => {
      if (!organization) {
        return next(unauthorized());
      }

      req.plugin = { plugin, orgId: organization.id };
      return next();
    })
    .catch(next);
};

/** The calling plugin; 403 for team members. */
export const pluginOf = (req: { plugin?: PluginCaller; actor?: Actor }): PluginCaller => {
  if (req.plugin) {
    return req.plugin;
  }

  if (req.actor) {
    throw new HttpError(403, 'PLUGIN_ONLY', 'Only plugins can do this');
  }

  throw unauthorized();
};

/** A team member or a plugin. */
export const callerOf = (req: { plugin?: PluginCaller; actor?: Actor }): Caller => {
  if (req.plugin) {
    return pluginCaller(req.plugin);
  }

  return userCaller(actorOf(req));
};

/** Who a session cookie belongs to, if it is still valid (for sign-out). */
export const sessionClaims = (req: Request): { userId: string; orgId: string } | null => {
  const token = readCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!token) return null;

  try {
    const claims = verifyAccessToken(token);

    return { userId: claims.sub, orgId: claims.org };
  } catch {
    return null;
  }
};

export const actorOf = (req: { actor?: Actor; plugin?: PluginCaller }): Actor => {
  if (req.plugin) {
    throw new HttpError(403, 'MEMBERS_ONLY', 'Plugins cannot do this');
  }

  if (!req.actor) {
    throw unauthorized();
  }

  return req.actor;
};
