var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'goals',
  typeDefs: `
        goalInserted(userId: String): Goal
        goalRead(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for goal
       */
      goalInserted: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.goalInserted._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetGoal($_id: String!) {
                goalDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('goalInserted'),
          (payload, variables) => {
            return payload.goalInserted.userId === variables.userId;
          }
        )
      },

      goalRead: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('goalRead'),
          (payload, variables) => {
            return payload.goalRead.userId === variables.userId;
          }
        )
      }
    };
  }
};
