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
            console.log('phoneCallReceived*******');
            const operatorIds = payload.phoneCallReceived.integration.operatorIds || [];

            return operatorIds.includes(variables.userId);
          }
        ),
      },
      sessionTerminateRequested: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('sessionTerminateRequested'),
          (payload, variables) => {
            console.log('payload...', payload.userId === variables.userId,
              's', variables, 'a');
            return payload.userId === variables.userId
          }
        )
      },
    };
  },
};
