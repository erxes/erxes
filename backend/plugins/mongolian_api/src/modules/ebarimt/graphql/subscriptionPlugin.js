var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'ebarimt',
  typeDefs: `
      automationResponded(userId: String, sessionCode: String): AutomationResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      automationResponded: {
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`automationResponded:${userId}`),
          // filter by _id
          (payload, variables) => {
            return (
              payload.automationResponded.sessionCode === variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
