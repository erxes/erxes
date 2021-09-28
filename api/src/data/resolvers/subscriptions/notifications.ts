import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for notification
   */
  notificationInserted: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('notificationInserted'),
      (payload, variables) => {
        return payload.notificationInserted.userId === variables.userId;
      }
    )
  },

  notificationRead: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('notificationRead'),
      (payload, variables) => {
        return payload.notificationRead.userId === variables.userId;
      }
    )
  }
};
