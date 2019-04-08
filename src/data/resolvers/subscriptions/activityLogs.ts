import pubsub from './pubsub';

export default {
  /*
   * Listen for activity log connection
   */
  activityLogsChanged: {
    subscribe: () => pubsub.asyncIterator('activityLogsChanged'),
  },
};
