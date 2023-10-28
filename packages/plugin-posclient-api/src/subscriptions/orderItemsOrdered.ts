import { withFilter } from 'graphql-subscriptions';
import { graphqlPubsub } from '../configs';

export default {
  /*
   * Listen for order items ordered
   */
  orderItemsOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('orderItemsOrdered'),
      (payload, variables) => {
        const { status } = payload.orderItemsOrdered;
        return variables.statuses.includes(status);
      }
    )
  }
};
