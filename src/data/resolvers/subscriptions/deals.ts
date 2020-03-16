import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for deal updates
   */
  dealsChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('dealsChanged'),
      // filter by _id
      (payload, variables) => {
        return payload.dealsChanged._id === variables._id;
      },
    ),
  },
};
