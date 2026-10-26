import { graphqlPubsub } from 'erxes-api-shared/utils';

/**
 * Publishes the `agentsThreadsChanged` event over the shared Redis pubsub so
 * the gateway's subscription server can push it to the acting user's sidebar.
 *
 * The plugin and the gateway each run their own `RedisPubSub` instance on the
 * same Redis, so a publish here is delivered to subscribers through the
 * gateway's graphql-ws server (the same mechanism every other plugin's
 * subscriptions use). The payload carries only the owning user id — the
 * subscription resolver filters on it — and the channel is a transient Redis
 * PUBLISH (no keyspace entry, no persistence).
 */
const THREADS_CHANGED_CHANNEL = 'agentsThreadsChanged';

export const publishAgentsThreadsChanged = (userId: string): void => {
  graphqlPubsub.publish(THREADS_CHANGED_CHANNEL, {
    agentsThreadsChanged: { userId },
  });
};
