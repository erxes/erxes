import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for customer connection
   */
  customerConnectionChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('customerConnectionChanged'),
      // filter by customerId
      (payload, variables) => {
        return payload.customerConnectionChanged._id === variables._id;
      }
    )
  }
};
