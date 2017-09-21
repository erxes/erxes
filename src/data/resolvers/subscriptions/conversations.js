import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './';

export default {
  /*
   * Listen for conversation changes like status, assignee, read state
  */
  conversationChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationChanged'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationChanged.conversationId === variables._id;
      },
    ),
  },

  /*
   * Listen for new message insertion
  */
  conversationMessageInserted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationMessageInserted.conversationId === variables._id;
      },
    ),
  },

  /*
   * Listen for any conversation changes like new message, read state, assignee
   */
  conversationsChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationsChanged'),
      // filter by customerId. customerId is not required.
      // in widget we will filter all those changes by customerId
      (payload, variables) => {
        if (variables.customerId) {
          return payload.conversationsChanged.customerId === variables.customerId;
        }

        return true;
      },
    ),
  },
};
