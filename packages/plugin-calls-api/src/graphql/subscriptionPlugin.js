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
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('phoneCallReceived'),
          async (payload, variables) => {
            const operatorIds = payload.phoneCallReceived.integration.operatorIds || [];

            return operatorIds.includes(variables.userId);
          }
        ),
      },
      sessionTerminateRequested: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('sessionTerminateRequested'),
          (payload, variables) => {
            return payload.userId === variables.userId
          }
        )
      },
    };
  },
};
