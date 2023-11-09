var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'goals',
  typeDefs: `
        goalCreated(userId: String): JSON
    `,
  generateResolvers: (graphqlPubsub) => {
    return {
      goalCreated: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('goalCreated'),
          async (payload, variables) => {
            const operatorIds =
              payload.goalCreated.integration.operatorIds || [];

            return operatorIds.includes(variables.userId);
          }
        )
      }
    };
  }
};
