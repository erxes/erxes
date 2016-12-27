import { PubSub, SubscriptionManager } from 'graphql-subscriptions';
import schema from './schema';

const pubsub = new PubSub();

const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub,
  setupFunctions: {
    messageInserted: (options, args) => ({
      newMessagesChannel: {
        filter: (message) => {
          return message.conversationId === args.conversationId
        },
      }
    }),
  },
});

export { subscriptionManager, pubsub };
