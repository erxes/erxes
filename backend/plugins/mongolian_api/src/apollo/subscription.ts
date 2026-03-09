import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'mongolian',

  typeDefs: `
    ebarimtResponded(userId: String, processId: String): String
    productPlacesResponded(userId: String, sessionCode: String): String
  `,

  generateResolvers: (graphqlPubsub) => {
    return {
      ebarimtResponded: {
        subscribe: withFilter(
          (_, { userId }) => graphqlPubsub.asyncIterator(`ebarimtResponded:${userId}`),
          (payload, variables) => {
            return variables?.userId && payload?.ebarimtResponded?.userId === variables?.userId;
          },
        ),
      },
      productPlacesResponded: {
  subscribe: withFilter(
    (_, { userId }) => {
      return graphqlPubsub.asyncIterator(`productPlacesResponded:${userId}`);
    },
    (payload, variables) => {
      const match = variables?.userId && payload?.productPlacesResponded?.userId === variables?.userId;
      return match;
    }
  ),
  resolve: (payload) => JSON.stringify(payload.productPlacesResponded),
},
    };
  },
};