import { withFilter } from 'graphql-subscriptions';
import pubsub from './pubsub';

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
   * Admin is listening for this subscription to show unread notification
  */
  conversationClientMessageInserted: {
    subscribe: () => pubsub.asyncIterator('conversationClientMessageInserted'),
  },

  /*
   * Widget is listening for this subscription to show unread notification
  */
  conversationAdminMessageInserted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationAdminMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationAdminMessageInserted.customerId === variables.customerId;
      },
    ),
  },
};
