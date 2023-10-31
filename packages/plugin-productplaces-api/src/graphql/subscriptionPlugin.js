var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "ebarimt",
  typeDefs: `
      productPlacesResponded(userId: String, sessionCode: String): ProductPlacesResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      productPlacesResponded: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("productPlacesResponded"),
          // filter by _id
          (payload, variables) => {
            return (
              payload.productPlacesResponded.userId === variables.userId &&
              payload.productPlacesResponded.sessionCode === variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
