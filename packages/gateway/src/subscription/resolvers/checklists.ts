import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  /*
   * Listen for checklist updates
   */
  checklistsChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('checklistsChanged'),
      (payload, variables) => {
        const { contentType, contentTypeId } = payload.checklistsChanged;

        return (
          contentType === variables.contentType &&
          contentTypeId === variables.contentTypeId
        );
      }
    )
  },

  checklistDetailChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('checklistDetailChanged'),
      (payload, variables) => {
        return payload.checklistDetailChanged._id === variables._id;
      }
    )
  }
};
