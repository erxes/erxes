var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'calls',
  typeDefs: `
      phoneCallReceived(userId: String): JSON
      sessionTerminateRequested(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      phoneCallReceived: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`phoneCallReceived:${userId}`),
      },
      sessionTerminateRequested: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`sessionTerminateRequested:${userId}`),
      },
    };
  },
};
