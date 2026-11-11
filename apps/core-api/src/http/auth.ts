import { db, users } from '@erxes/core-db';
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: Actor;
    }
  }
}

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
  if (PUBLIC_PATHS.has(req.path)) {
    return next();
  }

  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
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

export const actorOf = (req: { actor?: Actor }): Actor => {
  if (!req.actor) {
    throw unauthorized();
  }

  return req.actor;
};
