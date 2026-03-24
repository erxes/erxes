import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'mongolian',
  typeDefs: `
    ebarimtResponded(userId: String, processId: String): EbarimtResponse
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      ebarimtResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`ebarimtResponded:${userId}`),
          (payload, variables) => {
            return (
              variables?.userId && payload?.ebarimtResponded?.userId === variables?.userId
            );
          },
        ),
      },
    }
  },
};
