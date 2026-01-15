import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'mongolian',
  typeDefs: `
    ebarimtResponded(userId: String, processId: String): AutomationResponse
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      ebarimtResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`ebarimtResponded:${userId}`),
          (payload, variables) => {
            return (
              payload.ebarimtResponded.processId === variables.processId
            );
          },
        ),
      },
    };
  },
};
