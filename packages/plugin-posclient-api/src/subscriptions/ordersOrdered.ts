import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

export default {
  /*
   * Listen for orders ordered
   */
  ordersOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ordersOrdered'),
      (payload, variables) => {
        const { status, customerId, posToken } = payload.ordersOrdered._doc
          ? payload.ordersOrdered._doc
          : payload.ordersOrdered;
        if (variables.customerId) {
          return (
            variables.posToken === posToken &&
            variables.statuses.includes(status) &&
            variables.customerId === customerId
          );
        }

        return (
          variables.posToken === posToken && variables.statuses.includes(status)
        );
      },
    ),
  },
};
