import { randomUUID } from 'crypto';
import { redis } from './redis';

const CLEARING_LOCK = 'permissions:cached-maps:clearing';
const CLEAR_AGAIN = 'permissions:cached-maps:clear-again';
const LOCK_TTL_SECONDS = 600;

const RELEASE_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0`;

const deleteCachedPermissionMaps = async () => {
  let cursor = '0';

  do {
    const [next, keys] = await redis.scan(
      cursor,
      'MATCH',
      'user_actions_*',
      'COUNT',
      1000,
    );

    cursor = next;

    if (keys.length) {
      await redis.unlink(...keys);
    }
  } while (cursor !== '0');
};

/**
 * Drops every user's cached permission map (`user_actions_<userId>`); they
 * rebuild on the next request. Redis is shared by every service and, on
 * SaaS, every organization, so one caller scans at a time: a caller that
 * finds a scan already running asks it to go round once more, because maps
 * rebuilt during that scan may predate its own definitions.
 */
export const clearCachedPermissionMaps = async (): Promise<void> => {
  const token = randomUUID();
  const locked = await redis.set(
    CLEARING_LOCK,
    token,
    'EX',
    LOCK_TTL_SECONDS,
    'NX',
  );

  if (!locked) {
    await redis.set(CLEAR_AGAIN, '1', 'EX', LOCK_TTL_SECONDS);
    return;
  }

  try {
    do {
      await redis.del(CLEAR_AGAIN);
      await deleteCachedPermissionMaps();
    } while (await redis.get(CLEAR_AGAIN));
  } finally {
    await redis.eval(RELEASE_LOCK, 1, CLEARING_LOCK, token);
  }

  // A request that came in between the last check and the release.
  if (await redis.get(CLEAR_AGAIN)) {
    await clearCachedPermissionMaps();
  }
};
