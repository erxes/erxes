import Redis from 'ioredis';
import Redlock from 'redlock';
import { config } from 'dotenv';
config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

/**
 * The subset of redlock's `Lock` the owner loop uses (extend-to-renew +
 * release). Declared structurally so the no-Redis stub below can satisfy the
 * same contract as a real redlock v5 `Lock` without any casting.
 */
export type TDiscordLock = {
  extend(ttl: number): Promise<TDiscordLock>;
  release(): Promise<unknown>;
};

// Likewise the subset of the Redlock client we consume.
type TRedlockLike = {
  acquire(resources: string[], duration: number): Promise<TDiscordLock>;
};

// Distributed lock so that, across horizontally-scaled replicas, only ONE
// process owns each bot's Gateway connection (and the work distributor). Mirrors
// the proven IMAP/call integration pattern. Degrades to a granting stub when
// Redis is absent so a single-instance deployment still runs (see below). Built
// in a factory so the export stays a `const` rather than a reassigned `let`.
const createRedlock = (): TRedlockLike => {
  if (REDIS_HOST) {
    const redis = new Redis({
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT || '6379', 10),
      password: REDIS_PASSWORD,
    });

    redis.on('error', (err) => {
      console.error('[discord] Redis connection error:', err);
    });

    return new Redlock([redis], {
      retryCount: 3,
      retryDelay: 100,
      driftFactor: 0.01,
    });
  }

  console.warn(
    '[discord] Redis not configured — assuming single instance and running ' +
      'without distributed locking. Multiple replicas without Redis WILL open ' +
      'duplicate Discord connections; Redis is required for HA.',
  );
  // Grant a no-op lock that always "succeeds": with no Redis there is no peer to
  // coordinate with, so this replica owns everything. Shaped like a redlock v5
  // Lock (`extend` returns a Lock, `release` resolves) so the owner loop's
  // renew/teardown calls work unchanged. NOTE: under the ownership gate, failing
  // to acquire means "don't open" — so the stub must GRANT (not throw), or a
  // single self-hosted instance with no Redis would never connect.
  const noopLock: TDiscordLock = {
    extend: () => Promise.resolve(noopLock),
    release: () => Promise.resolve(undefined),
  };
  return {
    acquire: () => Promise.resolve(noopLock),
  };
};

const redlock = createRedlock();

export { redlock };
