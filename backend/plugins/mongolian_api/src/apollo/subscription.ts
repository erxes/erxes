import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'mongolian',

  typeDefs: `
    ebarimtResponded(userId: String, sessionCode: String): EbarimtResponse
    productPlacesResponded(userId: String, sessionCode: String): ProductPlacesResponse
  `,

  generateResolvers: (graphqlPubsub) => {
    return {
      ebarimtResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`ebarimtResponded:${userId}`),
          (payload, variables) =>
            variables?.userId &&
            payload?.ebarimtResponded?.userId === variables?.userId &&
            (!variables?.sessionCode ||
              payload?.ebarimtResponded?.sessionCode ===
                variables?.sessionCode),
        ),
      },
      productPlacesResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`productPlacesResponded:${userId}`),
          (payload, variables) =>
            variables?.userId &&
            payload?.productPlacesResponded?.userId === variables?.userId,
        ),
        // no stringify
      },
    };
  },
};
