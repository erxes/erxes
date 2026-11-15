import type { Request, Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';

/**
 * Member sign-in: an HS256 token in an HttpOnly cookie. It lasts
 * `CORE_SESSION_HOURS` from the member's last request, renewed while they
 * work, and never longer than MAX_SESSION_SECONDS from the sign-in itself.
 * Core reads the member's status and session version on every request, so
 * renewing never outlives a sign-out, a password change or a disabled member.
 */
const AUDIENCE = 'erxes-core';

/** A cookie older than this is renewed on the next request: one Set-Cookie per quarter hour. */
const RENEW_AFTER_SECONDS = 15 * 60;

/** However active the member is, they sign in again 30 days after they last did. */
const MAX_SESSION_SECONDS = 30 * 24 * 60 * 60;

const accessSecret = () => new TextEncoder().encode(config.auth.jwtSecret);

const nowSeconds = () => Math.floor(Date.now() / 1000);

const AccessClaims = z.object({
  typ: z.literal('core_access'),
  sub: z.string().min(1),
  org: z.string().min(1),
  /** The member's session version when it was issued (see `users.sessionVersion`). */
  sv: z.number(),
  iat: z.number(),
  /** When the member signed in; tokens from before renewal existed have only `iat`. */
  auth_time: z.number().optional(),
});

export type AccessClaims = z.infer<typeof AccessClaims>;

interface SignOptions {
  ttlSeconds?: number;
  sessionVersion?: number;
  /** Unix seconds of the sign-in this token continues; now for a new sign-in. */
  signedInAt?: number;
}

/** Core access token (HS256, core's own secret), never past MAX_SESSION_SECONDS from sign-in. */
export const signAccessToken = (userId: string, orgId: string, options: SignOptions = {}) => {
  const now = nowSeconds();
  const signedInAt = options.signedInAt ?? now;
  const ttl = options.ttlSeconds ?? config.auth.accessTokenTtlSeconds;

  return new SignJWT({
    typ: 'core_access',
    org: orgId,
    sv: options.sessionVersion ?? 1,
    auth_time: signedInAt,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(Math.min(now + ttl, signedInAt + MAX_SESSION_SECONDS))
    .sign(accessSecret());
};

/** The claims of a valid member token; null for an expired, forged or foreign one. */
export const accessClaimsOf = async (token: string) => {
  const verified = await jwtVerify(token, accessSecret(), {
    algorithms: ['HS256'],
    audience: AUDIENCE,
  }).catch(() => null);

  return AccessClaims.safeParse(verified?.payload).data ?? null;
};

interface SessionOf {
  userId: string;
  orgId: string;
  sessionVersion: number;
  signedInAt?: number;
}

/** Signs the member in on this browser, or continues the sign-in `signedInAt` started. */
export const startSession = async (req: Request, res: Response, session: SessionOf) => {
  const token = await signAccessToken(session.userId, session.orgId, {
    ttlSeconds: config.auth.sessionHours * 60 * 60,
    sessionVersion: session.sessionVersion,
    signedInAt: session.signedInAt,
  });

  res.cookie(SESSION_COOKIE, token, sessionCookieOptions(req));
};

/**
 * Renews a session cookie a member is still using, so working members are
 * never signed out mid-task. A handler that sets the cookie itself (sign-out,
 * password change) does so later in the response, and the browser keeps that one.
 */
export const renewSession = async (req: Request, res: Response, claims: AccessClaims) => {
  const now = nowSeconds();
  const signedInAt = claims.auth_time ?? claims.iat;

  if (now - claims.iat < RENEW_AFTER_SECONDS || now - signedInAt >= MAX_SESSION_SECONDS) return;

  await startSession(req, res, {
    userId: claims.sub,
    orgId: claims.org,
    sessionVersion: claims.sv,
    signedInAt,
  });
};
