var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'calls',
  typeDefs: `
      phoneCallReceived(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      phoneCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('phoneCallReceived'),
          (payload, variables) => {
            return payload.phoneCallReceived._id === variables.userId;
          }
        ),
      },
    };
  },
};
