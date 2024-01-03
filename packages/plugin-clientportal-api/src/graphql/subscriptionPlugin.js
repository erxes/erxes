var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "clientportal",
  typeDefs: `
        clientPortalNotificationInserted(userId: String): ClientPortalNotification
        clientPortalNotificationRead(userId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for notification
       */
      clientPortalNotificationInserted: {
        resolve(
          payload,
          _args,
          { dataSources: { gatewayDataSource } },
          info
        ) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.clientPortalNotificationInserted._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetCPNotification($_id: String!) {
                clientPortalNotificationDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('clientPortalNotificationInserted'),
          (payload, variables) => {
            return payload.clientPortalNotificationInserted.userId === variables.userId;
          }
        )
      },
    
      clientPortalNotificationRead: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('clientPortalNotificationRead'),
          (payload, variables) => {
            return payload.clientPortalNotificationRead.userId === variables.userId;
          }
        )
      }
    };
  },
};