import { coreContract } from '@erxes/core-contract';
import { db, pluginInstallations, plugins, users, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '~/config';
import { readCookies, SESSION_COOKIE } from '~/http/cookies';
import { publicPaths } from '~/http/access';
import { HttpError } from '~/http/errors';
import { verifyJwt } from '~/lib/signing';

export type Role = 'owner' | 'admin' | 'member';

/** Who is calling, resolved from the access token on every request. */
export interface Actor {
  userId: string;
  orgId: string;
  role: Role;
}

/** A plugin calling core with a token for one organisation that installed it. */
export interface PluginCaller {
  plugin: string;
  orgId: string;
  /** Scopes the organisation granted (and the token carries). */
  scopes: string[];
}

/** A plugin calling with its deployment-wide token (no organisation): manifest only. */
export interface PluginService {
  plugin: string;
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
      pluginService?: PluginService;
      /** The member token's session version. */
      sessionVersion?: number;
    }
  }
}

export const userCaller = (actor: Actor): Caller => ({
  orgId: actor.orgId,
  actorType: 'user',
  actorId: actor.userId,
  source: 'core',
});

export const pluginCaller = (plugin: Pick<PluginCaller, 'plugin' | 'orgId'>): Caller => ({
  orgId: plugin.orgId,
  actorType: 'plugin',
  actorId: plugin.plugin,
  source: plugin.plugin,
});

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
  /** The member's session version when it was issued (see `users.sessionVersion`). */
  sv: number;
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
  sessionVersion = 1,
): string =>
  jwt.sign({ typ: 'core_access', org: orgId, sv: sessionVersion }, config.auth.jwtSecret, {
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

  if (claims.typ !== 'core_access' || !claims.sub || !claims.org || typeof claims.sv !== 'number') {
    throw new Error('not a core access token');
  }

  return claims as AccessClaims;
};

const unauthorized = () =>
  new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

/** Paths under /core/v1 that work without being signed in (public in the access map). */
const PUBLIC_PATHS = new Set([...publicPaths(coreContract), '/openapi.json', '/.well-known/jwks.json']);

/** JOSE `typ` of plugin access tokens (`POST /plugins/token`). */
export const PLUGIN_ACCESS_TYP = 'erxes-plugin-access+jwt';

/** Plugin tokens are ES256 JWTs with their own `typ`; member tokens are not. */
const isPluginToken = (token: string) => {
  try {
    const header = JSON.parse(Buffer.from(token.split('.')[0] ?? '', 'base64url').toString()) as { typ?: string };

    return header.typ === PLUGIN_ACCESS_TYP;
  } catch {
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

  if (bearer && isPluginToken(bearer)) {
    return authenticatePlugin(req, bearer, next);
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

  withOrg(claims.org, (tx) =>
    tx
      .select({ id: users.id, orgId: users.orgId, role: users.role, status: users.status, sessionVersion: users.sessionVersion })
      .from(users)
      .where(and(eq(users.id, claims.sub), eq(users.orgId, claims.org)))
      .limit(1),
  )
    .then(([user]) => {
      // Disabled, or the session predates a password change, reset or sign-out everywhere.
      if (!user || user.status !== 'active' || user.sessionVersion !== claims.sv) {
        return next(unauthorized());
      }

      req.actor = { userId: user.id, orgId: user.orgId, role: user.role };
      req.sessionVersion = claims.sv;
      return next();
    })
    .catch(next);
};

interface PluginClaims extends Record<string, unknown> {
  sub: string;
  org?: string;
  scope?: string;
}

/**
 * A plugin token (`POST /plugins/token`), checked on every request against
 * the registry and the organisation's installation: disabling a plugin or
 * uninstalling it cuts it off at once, and scopes can only shrink.
 */
const authenticatePlugin = (req: Request, token: string, next: NextFunction) => {
  verifyJwt<PluginClaims>(token, { typ: PLUGIN_ACCESS_TYP, audience: AUDIENCE })
    .then(async ({ payload }) => {
      const [plugin] = await db().select({ status: plugins.status }).from(plugins).where(eq(plugins.name, payload.sub)).limit(1);

      if (plugin?.status !== 'active') return next(unauthorized());

      if (!payload.org) {
        req.pluginService = { plugin: payload.sub };
        return next();
      }

      const org = payload.org;
      const [installation] = await withOrg(org, (tx) =>
        tx
          .select({ status: pluginInstallations.status, grantedScopes: pluginInstallations.grantedScopes })
          .from(pluginInstallations)
          .where(and(eq(pluginInstallations.orgId, org), eq(pluginInstallations.plugin, payload.sub)))
          .limit(1),
      );

      if (installation?.status !== 'active') return next(unauthorized());

      const granted = new Set(installation.grantedScopes);

      req.plugin = {
        plugin: payload.sub,
        orgId: payload.org,
        scopes: (payload.scope ?? '').split(' ').filter((scope) => granted.has(scope)),
      };
      return next();
    })
    .catch(() => next(unauthorized()));
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
export const sessionClaims = (req: Request): { userId: string; orgId: string; sessionVersion: number } | null => {
  const token = readCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!token) return null;

  try {
    const claims = verifyAccessToken(token);

    return { userId: claims.sub, orgId: claims.org, sessionVersion: claims.sv };
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
