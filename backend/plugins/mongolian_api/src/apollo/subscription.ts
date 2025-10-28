import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'mongolian',
  typeDefs: `
    automationResponded(userId: String, sessionCode: String): AutomationResponse
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      automationResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`automationResponded:${userId}`),
          (payload, variables) => {
            return (
              payload.automationResponded.sessionCode === variables.sessionCode
            );
          },
        ),
      },
    };
  },
};
