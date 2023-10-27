import { withFilter } from 'graphql-subscriptions';
import { graphqlPubsub } from '../configs';

export default {
  /*
   * Listen for orders ordered
   */
  ordersOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ordersOrdered'),
      (payload, variables) => {
        const { status, customerId } = payload.ordersOrdered;
        if (variables.customerId) {
          return (
            variables.statuses.includes(status) &&
            variables.customerId === customerId
          );
        }

        return variables.statuses.includes(status);
      }
    )
  }
};
