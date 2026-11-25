import Redis from 'ioredis';
import Redlock, { ResourceLockedError } from 'redlock';
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

/* The call's session lock stayed busy; the webhook answers 503 so the PBX retries. */
export class CallLockBusyError extends Error {
  constructor(key: string, cause: unknown) {
    super(
      `call lock ${key} is busy: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'CallLockBusyError';
  }
}

interface ILockSettings {
  retryCount: number;
  retryDelay: number;
}

/*
 * Runs the routine under a Redlock lock that extends itself while the routine
 * runs, so a slow holder keeps the lock. Rejects with CallLockBusyError when
 * the lock cannot be taken. A lock lost mid-routine or a failed release is
 * logged; the routine's own result or error stands.
 */
const withLock = async <T>(
  key: string,
  ttlMs: number,
  settings: ILockSettings,
  routine: () => Promise<T>,
): Promise<T> => {
  let started = false;
  let finished = false;
  let result: T | undefined;

  try {
    return await redlock.using([key], ttlMs, settings, async (signal) => {
      started = true;
      result = await routine();
      finished = true;
      if (signal.aborted) {
        console.error(
          `[call] lost lock ${key} while holding it:`,
          signal.error?.message,
        );
      }
      return result;
    });
  } catch (error) {
    if (finished) {
      console.error(`[call] could not release lock ${key}:`, error);
      return result as T;
    }
    if (!started) throw new CallLockBusyError(key, error);
    throw error;
  }
};

/*
 * Every leg of one call shares its linkedid, so legs that arrive together
 * (CTI events, CDRs, peer integrations) serialize on the same session lock.
 */
export const withSessionLock = <T>(
  subdomain: string,
  { uniqueid, linkedid }: ICallLockKeys,
  routine: () => Promise<T>,
): Promise<T> => {
  const callId = linkedid || uniqueid;
  if (!callId) return routine();

  return withLock(
    `${subdomain}:call:session:${callId}`,
    SESSION_LOCK_TTL_MS,
    { retryCount: 40, retryDelay: 250 },
    routine,
  );
};

/*
 * Keyed on the phone alone, so a caller whose legs land on peer integrations
 * (same trunk or phone) still gets one customer and one conversation. Best
 * effort: when the lock stays busy the routine runs without it.
 */
export const withCustomerLock = async <T>(
  subdomain: string,
  customerPhone: string | undefined,
  routine: () => Promise<T>,
): Promise<T> => {
  if (!customerPhone) return routine();

  const key = `${subdomain}:call:customer:${customerPhone}`;

  try {
    return await withLock(
      key,
      CUSTOMER_LOCK_TTL_MS,
      { retryCount: 20, retryDelay: 250 },
      routine,
    );
  } catch (error) {
    if (!(error instanceof CallLockBusyError)) throw error;
    debugCall(`customer lock skipped for ${key}: ${error.message}`);
    return routine();
  }
};
