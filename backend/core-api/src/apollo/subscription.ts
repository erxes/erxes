import { GraphQLError } from 'graphql';
import { withFilter } from 'graphql-subscriptions';

// Whose events a socket hears comes from its session, never from arguments;
// the userId arguments stay in the schema only so older clients still parse
const signedInUserId = (context) => {
  const userId = context?.user?._id;

  if (!userId) {
    throw new GraphQLError('Login required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  return userId;
};

export default {
  name: 'core',
  typeDefs: `
            notificationInserted(userId: String): Notification
            notificationRead(userId: String): JSON
            notificationArchived(userId: String): JSON
            activityLogInserted(userId: String, targetId: String): ActivityLog
            userStatusChanged(_id: String): User
            broadcastChanged(engageMessageId: String): JSON
            agentsThreadsChanged: AgentsThreadsChanged
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
        subscribe: (_, __, context) =>
          graphqlPubsub.asyncIterator(
            `notificationInserted:${context.subdomain}:${signedInUserId(
              context,
            )}`,
          ),
      },

      notificationRead: {
        subscribe: (_, __, context) =>
          graphqlPubsub.asyncIterator(
            `notificationRead:${signedInUserId(context)}`,
          ),
      },
      notificationArchived: {
        subscribe: (_, __, context) =>
          graphqlPubsub.asyncIterator(
            `notificationArchived:${signedInUserId(context)}`,
          ),
      },
      activityLogInserted: {
        resolve: (payload) => {
          return payload.activityLogInserted;
        },
        subscribe: (_, { targetId }, context) => {
          const userId = signedInUserId(context);
          const { subdomain } = context;

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
        subscribe: (_, { _id }, context) => {
          signedInUserId(context);

          return graphqlPubsub.asyncIterator(
            _id
              ? `userStatusChanged:${context.subdomain}:${_id}`
              : `userStatusChanged:${context.subdomain}`,
          );
        },
      },
      /*
       * A campaign the broadcast worker moved. Without an id, every campaign
       * of the tenant is heard, which is what the list needs.
       */
      broadcastChanged: {
        resolve: (payload) => payload.broadcastChanged,
        subscribe: withFilter(
          (_, __, context) => {
            signedInUserId(context);

            return graphqlPubsub.asyncIterator(
              `broadcastChanged:${context.subdomain}`,
            );
          },
          (payload, { engageMessageId }) =>
            !engageMessageId ||
            payload.broadcastChanged.engageMessageId === engageMessageId,
        ),
      },

      /*
       * Agents chat sidebar refresh signal: transient per-user event
       * carrying only { userId }, delivered only to the owning subscriber.
       */
      agentsThreadsChanged: {
        resolve: (payload) => payload.agentsThreadsChanged,
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('agentsThreadsChanged'),
          (payload, _args, context) => {
            const event = payload && payload.agentsThreadsChanged;
            const userId = context && context.user && context.user._id;

            return !!userId && !!event && event.userId === userId;
          },
        ),
      },
    };
  },
};
