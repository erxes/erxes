import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

export default {
  /*
   * Listen for order items ordered
   */
  orderItemsOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('orderItemsOrdered'),
      (payload, variables) => {
        const { status, posToken } = payload.orderItemsOrdered;
        return (
          variables.posToken === posToken && variables.statuses.includes(status)
        );
      },
    ),
  },
};
