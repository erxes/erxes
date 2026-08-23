import Redis from 'ioredis';
import Redlock, { Lock } from 'redlock';
import { debugCall } from '@/integrations/call/debuggers';
import * as dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: Number.parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD,
});
export default redis;
export const redlock = new Redlock([redis]);

const CUSTOMER_LOCK_TTL_MS = 20_000;

export const acquireCustomerLock = async (
  subdomain: string,
  inboxIntegrationId: string,
  customerPhone: string,
): Promise<Lock | null> => {
  if (!inboxIntegrationId || !customerPhone) return null;

  const key = `${subdomain}:call:customer:${inboxIntegrationId}:${customerPhone}`;

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
