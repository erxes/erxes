var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'ebarimt',
  typeDefs: `
      productPlacesResponded(userId: String, sessionCode: String): ProductPlacesResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      productPlacesResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`productPlacesResponded:${userId}`),
          (payload, variables) => {
            return (
              payload.productPlacesResponded.sessionCode ===
              variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
