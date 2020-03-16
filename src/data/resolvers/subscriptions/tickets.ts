import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for ticket updates
   */
  ticketsChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ticketsChanged'),
      // filter by _id
      (payload, variables) => {
        return payload.ticketsChanged._id === variables._id;
      },
    ),
  },
};
