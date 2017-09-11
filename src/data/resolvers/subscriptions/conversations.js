import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './';

export default {
  conversationUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationUpdated'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationUpdated.conversationId === variables.conversationId;
      },
    ),
  },

  conversationNotification: {
    subscribe: () => pubsub.asyncIterator('conversationNotification'),
  },
};
