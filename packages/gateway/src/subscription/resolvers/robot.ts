import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  onboardingChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('onboardingChanged'),
      (payload, variables) => {
        if (!payload) {
          return false;
        }

        return payload.onboardingChanged.userId === variables.userId;
      }
    )
  }
};
