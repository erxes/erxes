import { withFilter } from 'graphql-subscriptions';
import { graphqlPubsub } from '../configs';

export default {
  /*
   * Listen for slot changes
   */
  slotsStatusUpdated: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('slotsStatusUpdated'),
      (payload, variables) => {
        if (!variables.posToken) {
          return false;
        }

        return Boolean(
          (payload.slotsStatusUpdated || []).filter(
            s => s.posToken === variables.posToken
          ).length
        );
      }
    )
  }
};
