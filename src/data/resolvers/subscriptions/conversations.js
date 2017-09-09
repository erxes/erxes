import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './';

export default {
  conversationMessageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationMessageAdded'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationMessageAdded.conversationId === variables.conversationId;
      },
    ),
  },
};
