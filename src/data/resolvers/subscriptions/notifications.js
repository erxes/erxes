import { pubsub } from './';

export default {
  /*
   * Listen for any notifications read state
   */
  notificationsChanged: {
    subscribe: () => pubsub.asyncIterator('notificationsChanged'),
  },
};
