export default {
  name: 'core',
  typeDefs: `
            notificationInserted(userId: String): Notification
            notificationRead(userId: String): JSON
            notificationArchived(userId: String): JSON
            activityLogInserted(userId: String, targetType: String, targetId: String): ActivityLog
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for notification
       */
      notificationInserted: {
        resolve(
          payload,
          _params,
          { dataSources: { gatewayDataSource } },
          info,
        ) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.notificationInserted._id },
            buildQueryUsingSelections: (selections) => `
                query Subscription_GetNotification($_id: String!) {
                  notificationDetail(_id: $_id) {
                    ${selections}
                  }
                }
            `,
          });
        },
        subscribe: (_, { userId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `notificationInserted:${subdomain}:${userId}`,
          ),
      },

      notificationRead: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`notificationRead:${userId}`),
      },
      notificationArchived: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`notificationArchived:${userId}`),
      },
      activityLogInserted: {
        resolve: (payload) => {
          return payload.activityLogInserted;
        },
        subscribe: (_, { userId, targetType, targetId }, { subdomain }) => {
          if (targetType && targetId) {
            return graphqlPubsub.asyncIterator(
              `activityLogInserted:${subdomain}:${targetType}:${targetId}`,
            );
          }
          // Fallback to userId-based subscription if targetType/targetId not provided
          return graphqlPubsub.asyncIterator(
            `activityLogInserted:${subdomain}:${userId}`,
          );
        },
      },
    };
  },
};
