var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'multierkhet',
  typeDefs: `
      multierkhetResponded(userId: String, sessionCode: String): MultierkhetResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      multierkhetResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`multierkhetResponded:${userId}`),
          // filter by _id
          (payload, variables) => {
            return (
              payload.multierkhetResponded.sessionCode === variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
