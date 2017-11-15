import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './';

export default {
  /*
   * Listen for any notifications read state
   */
  notificationsChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('notificationsChanged'),
      // filter by notificationIds
      (payload, variables) => {
        const notificationIds = payload.notificationsChanged.notificationIds;
        const ids = variables.ids;

        return (
          notificationIds.length == ids.length &&
          notificationIds.every((element, index) => {
            return element === ids[index];
          })
        );
      },
    ),
  },
};
