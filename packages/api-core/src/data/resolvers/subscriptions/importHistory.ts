import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for import history updates
   */
  importHistoryChanged: {
    subscribe: () => graphqlPubsub.asyncIterator('importHistoryChanged')
  }
};
