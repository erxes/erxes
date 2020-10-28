import { graphqlPubsub } from '../../../pubsub';

export default {
  /*
   * Listen for activity log connection
   */
  activityLogsChanged: {
    subscribe: () => graphqlPubsub.asyncIterator('activityLogsChanged')
  }
};
