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
        subscribe: (_, { userId }) => graphqlPubsub.asyncIterator(`clientPortalNotificationInserted:${userId}`),
      },
    
      clientPortalNotificationRead: {
        subscribe: (_, { userId }) => graphqlPubsub.asyncIterator(`clientPortalNotificationRead:${userId}`),
      }
    };
  },
};