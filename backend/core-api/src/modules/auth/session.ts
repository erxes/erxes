import { createHash, randomBytes } from 'crypto';
import {
  getEnv,
  getSaasOrganizationDetail,
  redis,
} from 'erxes-api-shared/utils';
import { Request, Response } from 'express';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '@/organization/settings/utils/configs';

export type SessionMethod =
  | 'password'
  | 'ldap'
  | 'sso'
  | 'magic_link'
  | 'invitation'
  | 'saas_handoff'
  | 'support';

export interface ISessionPolicy {
  idleSecs: number;
  absoluteSecs: number;
}

export interface ISession {
  userId: string;
  method: SessionMethod;
  createdAt: number;
  lastSeenAt: number;
  // Absolute cap: sliding never extends past it
  expiresAt: number;
  idleSecs: number;
  userAgent?: string;
}

export const DEFAULT_SESSION_POLICY: ISessionPolicy = {
  idleSecs: 7 * 24 * 60 * 60,
  absoluteSecs: 30 * 24 * 60 * 60,
};

const MIN_IDLE_SECS = 5 * 60;
const MAX_SESSION_SECS = 90 * 24 * 60 * 60;

// Gateway reads both names; keep in sync with gateway/src/util/session.ts
export const SESSION_COOKIE = 'erxes-sid';
// Browsers accept __Host- cookies only when Secure, host-only and path=/
export const SECURE_SESSION_COOKIE = '__Host-erxes-sid';

// Redis keeps only the hash, so reading Redis never yields a usable cookie
const hashSid = (sid: string) => createHash('sha256').update(sid).digest('hex');

const sessionKey = (subdomain: string, sidHash: string) =>
  `session:${subdomain}:${sidHash}`;

const userSessionsKey = (subdomain: string, userId: string) =>
  `user_sessions:${subdomain}:${userId}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** SESSION_IDLE_MINUTES / SESSION_MAX_HOURS from configs or env; unset keeps defaults. */
export const getSessionPolicy = async (
  models: IModels,
): Promise<ISessionPolicy> => {
  const idleMinutes = Number(
    await getConfig('SESSION_IDLE_MINUTES', '', models),
  );
  const maxHours = Number(await getConfig('SESSION_MAX_HOURS', '', models));

  // Bounds keep a typo from locking everyone out or never expiring
  const idleSecs =
    idleMinutes > 0
      ? clamp(idleMinutes * 60, MIN_IDLE_SECS, MAX_SESSION_SECS)
      : DEFAULT_SESSION_POLICY.idleSecs;

  const absoluteSecs =
    maxHours > 0
      ? clamp(maxHours * 60 * 60, MIN_IDLE_SECS, MAX_SESSION_SECS)
      : DEFAULT_SESSION_POLICY.absoluteSecs;

  return { idleSecs: Math.min(idleSecs, absoluteSecs), absoluteSecs };
};

// Drops hashes whose session already expired so the set does not grow forever
const pruneUserSessions = async (subdomain: string, userId: string) => {
  const hashes = await redis.smembers(userSessionsKey(subdomain, userId));

  if (!hashes.length) {
    return;
  }

  const exists = await Promise.all(
    hashes.map((hash) => redis.exists(sessionKey(subdomain, hash))),
  );
  const expired = hashes.filter((_hash, index) => !exists[index]);

  if (expired.length) {
    await redis.srem(userSessionsKey(subdomain, userId), ...expired);
  }
};

export const createSession = async ({
  subdomain,
  userId,
  method,
  policy,
  userAgent,
}: {
  subdomain: string;
  userId: string;
  method: SessionMethod;
  policy: ISessionPolicy;
  userAgent?: string;
}) => {
  const sid = randomBytes(32).toString('base64url');
  const sidHash = hashSid(sid);
  const now = Date.now();

  const session: ISession = {
    userId,
    method,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + policy.absoluteSecs * 1000,
    idleSecs: policy.idleSecs,
    userAgent,
  };

  await pruneUserSessions(subdomain, userId);

  await redis
    .multi()
    .set(
      sessionKey(subdomain, sidHash),
      JSON.stringify(session),
      'EX',
      policy.idleSecs,
    )
    .sadd(userSessionsKey(subdomain, userId), sidHash)
    .expire(userSessionsKey(subdomain, userId), policy.absoluteSecs)
    .exec();

  return sid;
};

export const revokeSession = async (subdomain: string, sid: string) => {
  const sidHash = hashSid(sid);
  const raw = await redis.get(sessionKey(subdomain, sidHash));

  await redis.del(sessionKey(subdomain, sidHash));

  if (raw) {
    const { userId } = JSON.parse(raw) as ISession;

    await redis.srem(userSessionsKey(subdomain, userId), sidHash);
  }
};

/**
 * Signs a user out everywhere, optionally keeping the caller's own session.
 * Returns how many live sessions were ended.
 */
export const revokeUserSessions = async (
  subdomain: string,
  userId: string,
  keepSid?: string,
) => {
  const keepHash = keepSid ? hashSid(keepSid) : undefined;
  const hashes = await redis.smembers(userSessionsKey(subdomain, userId));
  const revoked = hashes.filter((hash) => hash !== keepHash);

  if (!revoked.length) {
    return 0;
  }

  const results = await redis
    .multi()
    .del(...revoked.map((hash) => sessionKey(subdomain, hash)))
    .srem(userSessionsKey(subdomain, userId), ...revoked)
    .exec();

  // DEL counts only keys that still existed, i.e. live sessions
  return Number(results?.[0]?.[1] ?? 0);
};

export interface ISessionSummary {
  // The sid hash: names the session without being usable as a cookie
  _id: string;
  method: SessionMethod;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  userAgent?: string;
  current: boolean;
}

/** A user's live sessions, most recently used first. */
export const listUserSessions = async (
  subdomain: string,
  userId: string,
  currentSid?: string,
): Promise<ISessionSummary[]> => {
  const hashes = await redis.smembers(userSessionsKey(subdomain, userId));

  if (!hashes.length) {
    return [];
  }

  const raws = await redis.mget(
    ...hashes.map((hash) => sessionKey(subdomain, hash)),
  );
  const currentHash = currentSid ? hashSid(currentSid) : '';

  return hashes
    .flatMap((hash, index) => {
      const raw = raws[index];

      if (!raw) {
        return [];
      }

      const session = JSON.parse(raw) as ISession;

      return [
        {
          _id: hash,
          method: session.method,
          createdAt: new Date(session.createdAt),
          lastSeenAt: new Date(session.lastSeenAt),
          expiresAt: new Date(session.expiresAt),
          userAgent: session.userAgent,
          current: hash === currentHash,
        },
      ];
    })
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
};

// lastSeenAt moves at most every 5 minutes, so "now" needs a wider window
const ACTIVE_WINDOW_MS = 10 * 60 * 1000;

export type SessionState = 'active' | 'idle' | 'none';

/** Presence for avatars: used in the last 10 minutes, signed in but idle, or signed out. */
export const getSessionState = async (
  subdomain: string,
  userId: string,
): Promise<SessionState> => {
  const hashes = await redis.smembers(userSessionsKey(subdomain, userId));

  if (!hashes.length) {
    return 'none';
  }

  const raws = await redis.mget(
    ...hashes.map((hash) => sessionKey(subdomain, hash)),
  );
  const lastSeen = raws
    .filter((raw): raw is string => Boolean(raw))
    .map((raw) => (JSON.parse(raw) as ISession).lastSeenAt);

  if (!lastSeen.length) {
    return 'none';
  }

  return Date.now() - Math.max(...lastSeen) < ACTIVE_WINDOW_MS
    ? 'active'
    : 'idle';
};

/** Ends one session by its id, only when it belongs to this user. */
export const revokeUserSession = async (
  subdomain: string,
  userId: string,
  sessionId: string,
) => {
  const owned = await redis.sismember(
    userSessionsKey(subdomain, userId),
    sessionId,
  );

  if (!owned) {
    return false;
  }

  await redis
    .multi()
    .del(sessionKey(subdomain, sessionId))
    .srem(userSessionsKey(subdomain, userId), sessionId)
    .exec();

  return true;
};

export const readSessionCookie = (cookies?: Record<string, string>) =>
  cookies?.[SECURE_SESSION_COOKIE] || cookies?.[SESSION_COOKIE] || '';

// SaaS custom domains and SAME_SITE=none deployments call the API cross-site
const isCrossSite = async (subdomain: string, req: Request) => {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    const organization = await getSaasOrganizationDetail({ subdomain });

    return Boolean(organization?.domain && organization.dnsStatus === 'active');
  }

  return (
    getEnv({ name: 'SAME_SITE' }) === 'none' &&
    req.headers.origin !== getEnv({ name: 'DOMAIN', subdomain })
  );
};

const getCookieOptions = async (
  subdomain: string,
  req: Request,
  maxAgeSecs?: number,
) => {
  const crossSite = await isCrossSite(subdomain, req);
  // Cross-site cookies must be Secure, as the SaaS path always did
  const secure = req.secure || crossSite;

  return {
    name: secure ? SECURE_SESSION_COOKIE : SESSION_COOKIE,
    options: {
      httpOnly: true,
      secure,
      sameSite: crossSite ? ('none' as const) : ('lax' as const),
      path: '/',
      ...(maxAgeSecs ? { maxAge: maxAgeSecs * 1000 } : {}),
    },
  };
};

/** The one way a staff user gets signed in: creates the session and sets its cookie. */
export const startSession = async ({
  models,
  subdomain,
  userId,
  method,
  policy: policyOverride,
  req,
  res,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  method: SessionMethod;
  // Support visits bring their own: capped by the grant, not the tenant policy
  policy?: ISessionPolicy;
  req: Request;
  res: Response;
}) => {
  const policy = policyOverride || (await getSessionPolicy(models));
  const userAgent = req.headers['user-agent'];

  const sid = await createSession({
    subdomain,
    userId,
    method,
    policy,
    userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 256) : '',
  });

  const { name, options } = await getCookieOptions(
    subdomain,
    req,
    policy.absoluteSecs,
  );

  res.cookie(name, sid, options);
};

export const endSession = async ({
  subdomain,
  req,
  res,
}: {
  subdomain: string;
  req: Request;
  res: Response;
}) => {
  const sid = readSessionCookie(req.cookies);

  if (sid) {
    await revokeSession(subdomain, sid);
  }

  const { options } = await getCookieOptions(subdomain, req);

  res.clearCookie(SECURE_SESSION_COOKIE, { ...options, secure: true });
  res.clearCookie(SESSION_COOKIE, options);
};
