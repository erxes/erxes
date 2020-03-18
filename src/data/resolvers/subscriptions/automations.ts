import { withFilter } from 'apollo-server-express';
import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for automations
   */
  automationResponded: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('automationResponded'),
      (payload, variables) => {
        return (
          payload.automationResponded.userId === variables.userId &&
          payload.automationResponded.sessionCode === variables.sessionCode
        );
      },
    ),
  },
};
