import { RedisPubSub } from "graphql-redis-subscriptions";
import { withFilter } from "graphql-subscriptions";
import { Collection } from "mongodb";

export default function genConversationSubscriptionResolvers({
  Channels,
  Conversations,
  Integrations,
  graphqlPubsub,
}: {
  Channels: Collection<any>;
  Conversations: Collection<any>;
  Integrations: Collection<any>;
  graphqlPubsub: RedisPubSub
}) {
  return {
    /*
     * Listen for conversation changes like status, assignee, read state
     */
    conversationChanged: {
      subscribe: withFilter(
        () => graphqlPubsub.asyncIterator("conversationChanged"),
        // filter by conversationId
        (payload, variables) => {
          return payload.conversationChanged.conversationId === variables._id;
        }
      ),
    },

    /*
     * Listen for new message insertion
     */
    conversationMessageInserted: {
      resolve(
        payload: any,
        args: any,
        { dataSources: { gatewayDataSource } }: any,
        info: any
      ) {
        return gatewayDataSource.queryAndMergeMissingConversationMessageData({
          payload,
          info,
        });
      },
      subscribe: withFilter(
        () => graphqlPubsub.asyncIterator("conversationMessageInserted"),
        // filter by conversationId
        (payload, variables) => {
          return (
            payload.conversationMessageInserted.conversationId === variables._id
          );
        }
      ),
    },

    /*
     * Show typing while waiting Bot response
     */
    conversationBotTypingStatus: {
      subscribe: withFilter(
        () => graphqlPubsub.asyncIterator("conversationBotTypingStatus"),
        async (payload, variables) => {
          return (
            payload.conversationBotTypingStatus.conversationId === variables._id
          );
        }
      ),
    },

    /*
     * Admin is listening for this subscription to show typing notification
     */
    conversationClientTypingStatusChanged: {
      subscribe: withFilter(
        () =>
          graphqlPubsub.asyncIterator("conversationClientTypingStatusChanged"),
        async (payload, variables) => {
          return (
            payload.conversationClientTypingStatusChanged.conversationId ===
            variables._id
          );
        }
      ),
    },

    /*
     * Admin is listening for this subscription to show unread notification
     */
    conversationClientMessageInserted: {
      resolve(
        payload: any,
        args: any,
        { dataSources: { gatewayDataSource } }: any,
        info: any
      ) {
        return gatewayDataSource.queryAndMergeMissingConversationMessageData({
          payload,
          info,
        });
      },
      subscribe: withFilter(
        () => graphqlPubsub.asyncIterator("conversationClientMessageInserted"),
        async (payload, variables) => {
          const message = payload.conversationClientMessageInserted;

          const conversation = await Conversations.findOne({
            _id: message.conversationId,
          });

          if (!conversation) {
            return false;
          }

          const integration = await Integrations.findOne({
            _id: conversation.integrationId,
          });

          if (!integration) {
            return false;
          }

          const availableChannelsCount = await Channels.countDocuments({
            integrationIds: { $in: [integration._id] },
            memberIds: { $in: [variables.userId] },
          });

          return availableChannelsCount > 0;
        }
      ),
    },

    /*
     * Widget is listening for this subscription to show unread notification
     */
    conversationAdminMessageInserted: {
      subscribe: withFilter(
        () => graphqlPubsub.asyncIterator("conversationAdminMessageInserted"),
        // filter by conversationId
        (payload, variables) => {
          return (
            payload.conversationAdminMessageInserted.customerId ===
            variables.customerId
          );
        }
      ),
    },

    /*
     * Integrations api is listener
     */
    conversationExternalIntegrationMessageInserted: {
      subscribe: () =>
        graphqlPubsub.asyncIterator(
          "conversationExternalIntegrationMessageInserted"
        ),
    },
  };
}
