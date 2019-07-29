import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for notification
   */
  notificationInserted: {
    subscribe: () => graphqlPubsub.asyncIterator('notificationInserted'),
  },
};
