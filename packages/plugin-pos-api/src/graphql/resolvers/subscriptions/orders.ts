import { withFilter } from 'graphql-subscriptions';
import {} from 'apollo-server-express';
import { graphqlPubsub } from '../../pubsub';

export default {
  /*
   * Listen for orders ordered
   */
  ordersOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ordersOrdered'),
      (payload, variables) => {
        const { status } = payload.ordersOrdered;
        return variables.statuses.includes(status);
      }
    )
  }
};
