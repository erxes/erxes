var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'calls',
  typeDefs: `
      phoneCallReceived(subdomain: String!, userId: String): JSON
      sessionTerminateRequested(subdomain: String!, userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      phoneCallReceived: {
        subscribe: (_, { subdomain, userId }) =>
          graphqlPubsub.asyncIterator(
            `phoneCallReceived:${subdomain}:${userId}`,
          ),
      },
      sessionTerminateRequested: {
        subscribe: (_, { subdomain, userId }) =>
          graphqlPubsub.asyncIterator(
            `sessionTerminateRequested:${subdomain}:${userId}`,
          ),
      },
    };
  },
};
