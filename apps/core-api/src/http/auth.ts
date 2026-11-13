import { db, pluginInstallations, plugins, roles, users, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { decodeProtectedHeader, jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { readCookies, SESSION_COOKIE } from '~/http/cookies';
import { can, publicPaths } from '~/http/access';
import { HttpError } from '~/http/errors';
import { verifyJwt } from '~/lib/signing';
import { appServes } from '~/modules/customerAuth/customerApps';
import { customerOfToken } from '~/modules/customerAuth/customerSessions';

/** A role key: `owner`, `admin`, `member` or a custom `r_…`. */
export type Role = string;

/** Who is calling, resolved from the access token on every request. */
export interface Actor {
  userId: string;
  orgId: string;
  role: Role;
  /** The role's permission actions (`*`: every grantable one), loaded with the member. */
  permissions: readonly string[];
}

export const requirePermission = (
  actor: Actor,
  action: string,
  message = "Your role doesn't allow this",
) => {
  if (!can(actor, action)) {
    throw new HttpError(403, 'NOT_ALLOWED', message, { permission: action });
  }
};

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
 * a team member, a plugin, or core itself (automations, payments). `source` is
 * `core` for members and core, else the plugin.
 */
export type Caller = { orgId: string; source: string } & (
  | { actorType: 'user' | 'plugin'; actorId: string }
  | { actorType: 'system'; actorId: null }
);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: Actor;
      plugin?: PluginCaller;
      pluginService?: PluginService;
      /** The member token's session version. */
      sessionVersion?: number;
      /** A signed-in customer (`/customer/*` only). */
      customer?: CustomerCaller;
    }
  }
}

/** A customer calling `/customer/*` with an access token from a plugin's app. */
export interface CustomerCaller {
  orgId: string;
  customerId: string;
  sessionId: string;
  /** The plugin whose app the token was issued to. */
  clientId: string;
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

/** Core acting on its own: no member or plugin caused it. */
export const systemCaller = (orgId: string): Caller => ({
  orgId,
  actorType: 'system',
  actorId: null,
  source: 'core',
});

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

/** The member a token names, if still active at the token's session version. */
const activeMember = async (claims: z.output<typeof AccessClaims>) => {
  const [user] = await withOrg(claims.org, (tx) =>
    tx
      .select({
        id: users.id,
        orgId: users.orgId,
        role: users.role,
        status: users.status,
        sessionVersion: users.sessionVersion,
        permissions: roles.permissions,
      })
      .from(users)
      .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
      .where(and(eq(users.id, claims.sub), eq(users.orgId, claims.org)))
      .limit(1),
  );

  // Disabled, or the session predates a password change, reset or sign-out everywhere.
  if (!user || user.status !== 'active' || user.sessionVersion !== claims.sv) return null;

  return { userId: user.id, orgId: user.orgId, role: user.role, permissions: user.permissions };
};

/**
 * Requires a valid access token (Bearer header, or the session cookie set at
 * sign-in) whose user is still active in the token's organisation. Role and
 * status are read from the database, so a disabled member or a role change
 * applies on the next request.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  if (PUBLIC_PATHS.has(req.path) || isSignedFilePath(req.path)) {
    return next();
  }

  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  // A signed-in customer: their own routes only, and nobody else's token works there.
  // The token's app must still serve the organisation, and a browser call its origin.
  if (req.path.startsWith('/customer/')) {
    const customer = bearer ? await customerOfToken(bearer) : null;

    if (!customer || !(await appServes(customer.clientId, customer.orgId, req.get('origin')))) {
      throw unauthorized();
    }

    req.customer = customer;
    req.log.setBindings({ orgId: customer.orgId, customerId: customer.customerId });

    return next();
  }

  if (bearer && isPluginToken(bearer)) {
    await authenticatePlugin(req, bearer);

    return next();
  }

  const cookie = bearer ? '' : (readCookies(req.headers.cookie)[SESSION_COOKIE] ?? '');
  const token = bearer || cookie;

  if (!token) throw unauthorized();

  if (cookie && isCrossSiteWrite(req)) {
    throw new HttpError(403, 'CROSS_SITE', 'Cross-site request blocked');
  }

  const claims = await accessClaimsOf(token);
  const actor = claims && (await activeMember(claims));

  if (!claims || !actor) throw unauthorized();

  req.actor = actor;
  req.sessionVersion = claims.sv;
  req.log.setBindings({ orgId: actor.orgId, actorId: actor.userId });

  return next();
};

const PluginClaims = z.object({
  sub: z.string(),
  org: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * A plugin token (`POST /plugins/token`), checked on every request against
 * the registry and the organisation's installation: disabling a plugin or
 * uninstalling it cuts it off at once, and scopes can only shrink.
 */
const authenticatePlugin = async (req: Request, token: string) => {
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
    req.pluginService = { plugin: claims.sub };
    req.log.setBindings({ actorId: claims.sub });

    return;
  }

  const [installation] = await withOrg(org, (tx) =>
    tx
      .select({
        status: pluginInstallations.status,
        grantedScopes: pluginInstallations.grantedScopes,
      })
      .from(pluginInstallations)
      .where(and(eq(pluginInstallations.orgId, org), eq(pluginInstallations.plugin, claims.sub)))
      .limit(1),
  );

  if (installation?.status !== 'active') throw unauthorized();

  const granted = new Set(installation.grantedScopes);

  req.plugin = {
    plugin: claims.sub,
    orgId: org,
    scopes: (claims.scope ?? '').split(' ').filter((scope) => granted.has(scope)),
  };
  req.log.setBindings({ orgId: org, actorId: claims.sub });
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
export const sessionClaims = async (
  req: Request,
): Promise<{ userId: string; orgId: string; sessionVersion: number } | null> => {
  const token = readCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!token) return null;

  const claims = await accessClaimsOf(token);

  return claims && { userId: claims.sub, orgId: claims.org, sessionVersion: claims.sv };
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
