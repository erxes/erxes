import graphqlPubsub from '../pubsub';

export default {
  /*
   * Calendar events api is listener
   */
  calendarEventUpdated: {
    subscribe: () => graphqlPubsub.asyncIterator('calendarEventUpdated')
  }
};
