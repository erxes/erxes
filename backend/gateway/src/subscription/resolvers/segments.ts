import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  segmentBuildChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('segmentBuildChanged'),
      (payload, variables) =>
        payload.segmentBuildChanged.segmentId === variables.segmentId,
    ),
  },
};
