import { withFilter } from 'graphql-subscriptions';
import { graphqlPubsub } from '../configs';

export default {
  /*
   * Listen for slot changes
   */
  slotsStatusUpdated: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('slotsStatusUpdated'),
      payload => {
        console.log(payload, '----');
        return !!payload.slotsStatusUpdated;
      }
    )
  }
};
