import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for pipeline updates
   */
  pipelinesChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('pipelinesChanged'),
      // filter by _id
      (payload, variables) => {
        return payload.pipelinesChanged._id === variables._id;
      }
    )
  }
};
