import { createHash } from 'node:crypto';
import { redis } from 'erxes-api-shared/utils';

/*
 * The gateway downloads this file and serves its subscriptions. Kept untyped:
 * in development the gateway imports this file's raw source as `.js`, where
 * type syntax does not parse. Keep imports to packages the gateway resolves.
 */

const MESSAGING_TICKET_PREFIX = 'communication:messaging:ticket:';
const MESSAGING_WAKE_PREFIX = 'communication:messaging:wake:';
const MESSAGING_MAX_SUBSCRIPTION_MS = 3_600_000;

// Reading and deleting in one script lets exactly one subscriber across all
// gateway instances consume a ticket. GETDEL would need Redis 6.2.
const CONSUME_MESSAGING_TICKET = `
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
`;

const invalidMessagingTicket = () =>
  new Error('Invalid messaging subscription ticket');

const consumeMessagingTicket = async (ticket) => {
  if (typeof ticket !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(ticket)) {
    throw invalidMessagingTicket();
  }
  const digest = createHash('sha256').update(ticket).digest('hex');
  const raw = await redis.eval(
    CONSUME_MESSAGING_TICKET,
    1,
    MESSAGING_TICKET_PREFIX + digest,
  );
  let record;
  try {
    record = typeof raw === 'string' ? JSON.parse(raw) : null;
  } catch {
    record = null;
  }
  const now = Date.now();
  if (
    typeof record?.topic !== 'string' ||
    !record.topic.startsWith(MESSAGING_WAKE_PREFIX) ||
    typeof record.authorizedUntil !== 'number' ||
    record.authorizedUntil <= now
  ) {
    throw invalidMessagingTicket();
  }
  return {
    topic: record.topic,
    deadline: Math.min(
      record.authorizedUntil,
      now + MESSAGING_MAX_SUBSCRIPTION_MS,
    ),
  };
};

// Completes the stream when its authorization ends. graphql-ws then sends the
// client an explicit `complete` instead of leaving an idle subscription open.
const endAtDeadline = (iterator, deadline) => {
  let timer;
  const expired = new Promise((resolve) => {
    timer = setTimeout(resolve, deadline - Date.now());
  }).then(() => ({ value: undefined, done: true }));
  const finish = async () => {
    clearTimeout(timer);
    await iterator.return?.();
    return { value: undefined, done: true };
  };
  return {
    next: async () => {
      const result = await Promise.race([iterator.next(), expired]);
      return result.done ? finish() : result;
    },
    return: finish,
    throw: async (error) => {
      await finish();
      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};

// Default export required by the gateway's subscription plugin loader.
export default {
  name: 'communication',
  typeDefs: `
    communicationMessagingWake(ticket: String!): Boolean!
  `,
  generateResolvers: (graphqlPubsub) => ({
    // A private wake-up carries no IDs or message content. The app fetches
    // durable events through its authenticated messaging GraphQL operations.
    communicationMessagingWake: {
      subscribe: async (_root, { ticket }) => {
        const { topic, deadline } = await consumeMessagingTicket(ticket);
        return endAtDeadline(graphqlPubsub.asyncIterator(topic), deadline);
      },
      resolve: () => true,
    },
  }),
};
