import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for task updates
   */
  tasksChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('tasksChanged'),
      // filter by _id
      (payload, variables) => {
        return payload.tasksChanged._id === variables._id;
      },
    ),
  },
};
