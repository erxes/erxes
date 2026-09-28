import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'core',
  typeDefs: `
            notificationInserted(userId: String): Notification
            notificationRead(userId: String): JSON
            notificationArchived(userId: String): JSON
            activityLogInserted(userId: String, targetId: String): ActivityLog
            userStatusChanged(_id: String): User
            broadcastChanged(engageMessageId: String): JSON
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
        subscribe: (_, { userId, targetId }, { subdomain }) => {
          if (targetId) {
            return graphqlPubsub.asyncIterator(
              `activityLogInserted:${subdomain}:${targetId}`,
            );
          }
          // Fallback to userId-based subscription if targetId not provided
          return graphqlPubsub.asyncIterator(
            `activityLogInserted:${subdomain}:${userId}`,
          );
        },
      },
      userStatusChanged: {
        resolve: (payload) => payload.userStatusChanged,
        subscribe: (_, { _id }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            _id
              ? `userStatusChanged:${subdomain}:${_id}`
              : `userStatusChanged:${subdomain}`,
          ),
      },
      /*
       * A campaign the broadcast worker moved. Without an id, every campaign
       * of the tenant is heard, which is what the list needs.
       */
      broadcastChanged: {
        resolve: (payload) => payload.broadcastChanged,
        subscribe: withFilter(
          (_, __, { subdomain }) =>
            graphqlPubsub.asyncIterator(`broadcastChanged:${subdomain}`),
          (payload, { engageMessageId }) =>
            !engageMessageId ||
            payload.broadcastChanged.engageMessageId === engageMessageId,
        ),
      },
    };
  },
};
