import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for growthHack updates
   */
  growthHacksChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('growthHacksChanged'),
      // filter by _id
      (payload, variables) => {
        return payload.growthHacksChanged._id === variables._id;
      },
    ),
  },
};
