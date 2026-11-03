import { createHash } from 'crypto';
import {
  redis,
  sendWorkerQueue,
  userActivityTrackingKey,
} from 'erxes-api-shared/utils';

// Written by core-api/src/modules/auth/session.ts; names and key format must match
export const SESSION_COOKIE = 'erxes-sid';
export const SECURE_SESSION_COOKIE = '__Host-erxes-sid';

// Sliding writes at most this often per session, not on every request
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

interface IStoredSession {
  userId: string;
  method: string;
  lastSeenAt: number;
  expiresAt: number;
  idleSecs: number;
}

// Activity stats must never slow down or fail the request that produced them
const recordActivity = async (
  subdomain: string,
  userId: string,
  at: number,
) => {
  try {
    if (!(await redis.exists(userActivityTrackingKey(subdomain)))) {
      return;
    }

    await sendWorkerQueue('logs', 'user_activity').add('touch', {
      subdomain,
      userId,
      at,
    });
  } catch {
    // Dropping one 5-minute slot is acceptable
  }
};

const sessionKey = (subdomain: string, sid: string) =>
  `session:${subdomain}:${createHash('sha256').update(sid).digest('hex')}`;

export const readSessionCookie = (cookies?: Record<string, string>) =>
  cookies?.[SECURE_SESSION_COOKIE] || cookies?.[SESSION_COOKIE] || '';

/** Returns the live session for this tenant and slides its idle window. */
export const verifySession = async (
  subdomain: string,
  sid: string,
): Promise<IStoredSession | null> => {
  const key = sessionKey(subdomain, sid);
  const raw = await redis.get(key);

  if (!raw) {
    return null;
  }

  const session = JSON.parse(raw) as IStoredSession;
  const now = Date.now();

  if (session.expiresAt <= now) {
    await redis.del(key);
    return null;
  }

  if (now - session.lastSeenAt >= TOUCH_INTERVAL_MS) {
    const ttlSecs = Math.min(
      session.idleSecs,
      Math.ceil((session.expiresAt - now) / 1000),
    );

    // XX: a session revoked meanwhile must not be written back
    await redis.set(
      key,
      JSON.stringify({ ...session, lastSeenAt: now }),
      'EX',
      ttlSecs,
      'XX',
    );

    void recordActivity(subdomain, session.userId, now);
  }

  return session;
};
