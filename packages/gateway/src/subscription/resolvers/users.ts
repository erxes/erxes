
import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';
export default {
  /*
   * Listen for current user
   */
  userChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('userChanged'),
      (payload, variables) => {
        return payload.userChanged.userId === variables.userId;
      }
    )
  }
};
