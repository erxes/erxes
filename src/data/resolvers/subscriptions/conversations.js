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
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationNotification'),
      // filter by customerId
      (payload, variables) => {
        if (variables.customerId) {
          return payload.conversationNotification.customerId === variables.customerId;
        }

        return true;
      },
    ),
  },
};
