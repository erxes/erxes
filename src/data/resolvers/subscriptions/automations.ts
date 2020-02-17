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
        console.log(payload);
        console.log(variables);
        return payload.automationResponded.userId === 'userId';
      },
    ),
  },
};
