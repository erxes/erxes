import { GraphQLError } from 'graphql';
import { redis } from 'erxes-api-shared/utils';
import type { MessagingActor } from './auth';
import { messagingError } from './errors';

export const MESSAGING_RATE_LIMITS = {
  send: { limit: 60, windowSeconds: 60 },
  createGroup: { limit: 10, windowSeconds: 600 },
  prepareAttachment: { limit: 30, windowSeconds: 300 },
  subscriptionTicket: { limit: 20, windowSeconds: 600 },
  registerDevice: { limit: 10, windowSeconds: 3600 },
} as const;

export type MessagingRateOperation = keyof typeof MESSAGING_RATE_LIMITS;

// One script increments the counter and sets its expiry, so concurrent
// requests on every instance share the window and a window always expires.
const FIXED_WINDOW = `
local count = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`;

const REDIS_TIMEOUT_MS = 2000;

const unavailable = () =>
  messagingError(
    'Messaging is temporarily unavailable. Retry later.',
    'SERVICE_UNAVAILABLE',
  );

const countRequest = async (key: string, windowMs: number) => {
  // The shared client queues commands while disconnected, which would hang the
  // request. Limits fail closed instead of being skipped.
  if (redis.status !== 'ready') throw unavailable();
  let timer: NodeJS.Timeout | undefined;
  try {
    const result = await Promise.race([
      redis.eval(FIXED_WINDOW, 1, key, windowMs),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('Messaging rate-limit counter timed out')),
          REDIS_TIMEOUT_MS,
        );
      }),
    ]);
    if (
      !Array.isArray(result) ||
      typeof result[0] !== 'number' ||
      typeof result[1] !== 'number'
    ) {
      throw new TypeError('Invalid messaging rate-limit counter response');
    }
    return { count: result[0], ttl: result[1] };
  } catch {
    throw unavailable();
  } finally {
    clearTimeout(timer);
  }
};

export const limitMessagingRate = async (
  { scope, member }: Pick<MessagingActor, 'scope' | 'member'>,
  operation: MessagingRateOperation,
) => {
  const { limit, windowSeconds } = MESSAGING_RATE_LIMITS[operation];
  const key =
    'frontline:messaging:rate:' +
    JSON.stringify([scope.tenant, scope.appId, member._id, operation]);
  const { count, ttl } = await countRequest(key, windowSeconds * 1000);
  if (count > limit) {
    throw new GraphQLError('Too many messaging requests. Retry later.', {
      extensions: {
        code: 'RATE_LIMITED',
        retryAfter: Math.max(1, Math.ceil(ttl / 1000)),
      },
    });
  }
};
