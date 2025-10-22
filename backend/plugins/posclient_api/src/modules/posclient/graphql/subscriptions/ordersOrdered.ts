import { graphqlPubsub } from 'erxes-api-shared/utils';
import { withFilter } from 'graphql-subscriptions';

export default {
  /*
   * Listen for orders ordered
   */
  ordersOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ordersOrdered'),
      (payload, variables) => {
        const { status, customerId, posToken, subToken } = payload.ordersOrdered
          ._doc
          ? payload.ordersOrdered._doc
          : payload.ordersOrdered;
        if (variables.customerId) {
          return (
            (variables.posToken === posToken ||
              variables.posToken === subToken) &&
            variables.statuses.includes(status) &&
            variables.customerId === customerId
          );
        }

        return (
          (variables.posToken === posToken ||
            variables.posToken === subToken) &&
          variables.statuses.includes(status)
        );
      },
    ),
  },
};
