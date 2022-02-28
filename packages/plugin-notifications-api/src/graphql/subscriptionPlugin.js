var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "notifications",
  typeDefs: `
        notificationInserted(userId: String): Notification
        notificationRead(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for notification
       */
      notificationInserted: {
        resolve(
          payload,
          _args,
          { dataSources: { gatewayDataSource } },
          info
        ) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.notificationInserted._id },
            buildQueryUsingSelections: (selections) => gql`
              query Subscription_GetNotification($_id: String!) {
                notificationDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('notificationInserted'),
          (payload, variables) => {
            return payload.notificationInserted.userId === variables.userId;
          }
        )
      },
    
      notificationRead: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('notificationRead'),
          (payload, variables) => {
            return payload.notificationRead.userId === variables.userId;
          }
        )
      }
    };
  },
};