var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "multierkhet",
  typeDefs: `
      multierkhetResponded(userId: String, sessionCode: String): MultierkhetResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      multierkhetResponded: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("multierkhetResponded"),
          // filter by _id
          (payload, variables) => {
            return (
              payload.multierkhetResponded.userId === variables.userId &&
              payload.multierkhetResponded.sessionCode === variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
