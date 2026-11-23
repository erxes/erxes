import Redis from 'ioredis';
import Redlock, { Lock, ResourceLockedError } from 'redlock';
import { debugCall } from '@/integrations/call/debuggers';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: Number.parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD,
});
redis.on('error', (error) => {
  console.error('[call] redis error:', error.message);
});
export default redis;

export const redlock = new Redlock([redis], {
  retryCount: 40,
  retryDelay: 250,
  retryJitter: 100,
});
redlock.on('error', (error) => {
  if (error instanceof ResourceLockedError) return;
  console.error('[call] redlock error:', error.message);
});

const SESSION_LOCK_TTL_MS = 20_000;
const CUSTOMER_LOCK_TTL_MS = 20_000;

export interface ICallLockKeys {
  uniqueid?: string;
  linkedid?: string;
}

/*
 * Every leg of one call shares its linkedid, so legs that arrive together
 * (CTI events, CDRs, peer integrations) serialize on the same session lock.
 */
export const acquireSessionLock = async (
  subdomain: string,
  { uniqueid, linkedid }: ICallLockKeys,
): Promise<Lock | null> => {
  const callId = linkedid || uniqueid;
  if (!callId) return null;

  const key = `${subdomain}:call:session:${callId}`;

  try {
    return await redlock.acquire([key], SESSION_LOCK_TTL_MS, {
      retryCount: 40,
      retryDelay: 250,
    });
  } catch (e) {
    throw new Error(`call session lock failure for ${key}: ${e.message}`);
  }
};

/*
 * Keyed on the phone alone, so a caller whose legs land on peer integrations
 * (same trunk or phone) still gets one customer and one conversation.
 */
export const acquireCustomerLock = async (
  subdomain: string,
  customerPhone?: string,
): Promise<Lock | null> => {
  if (!customerPhone) return null;

  const key = `${subdomain}:call:customer:${customerPhone}`;

  try {
    return await redlock.acquire([key], CUSTOMER_LOCK_TTL_MS, {
      retryCount: 20,
      retryDelay: 250,
    });
  } catch (e) {
    debugCall(`customer lock skipped for ${key}: ${e.message}`);
    return null;
  }
};

export const releaseLocks = async (
  label: string,
  locks: (Lock | null | undefined)[],
) => {
  for (const held of locks) {
    try {
      await held?.release();
    } catch (e) {
      console.error(`${label}: lock release failed`, e);
    }
  }
};
