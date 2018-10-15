import { withFilter } from 'graphql-subscriptions';
import pubsub from './pubsub';

export default {
  /*
   * Listen for customer connection
  */
  customerConnectionChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('customerConnectionChanged'),
      // filter by customerId
      (payload, variables) => {
        return payload.customerConnectionChanged._id === variables._id;
      },
    ),
  },
};
