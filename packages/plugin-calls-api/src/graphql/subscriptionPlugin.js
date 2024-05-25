module.exports = {
  name: 'calls',
  typeDefs: `
      phoneCallReceived(userId: String): JSON
      sessionTerminateRequested(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      phoneCallReceived: {
        subscribe: (_, { userId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `phoneCallReceived:${subdomain}:${userId}`,
          ),
      },
      sessionTerminateRequested: {
        subscribe: (_, { userId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `sessionTerminateRequested:${subdomain}:${userId}`,
          ),
      },
    };
  },
};
