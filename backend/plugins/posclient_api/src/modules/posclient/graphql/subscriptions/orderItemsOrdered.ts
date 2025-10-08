import { graphqlPubsub } from 'erxes-api-shared/utils';
import { withFilter } from 'graphql-subscriptions';

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
