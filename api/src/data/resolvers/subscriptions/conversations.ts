import { withFilter } from 'graphql-subscriptions';
import { Channels, Conversations } from '../../../db/models';
import { graphqlPubsub } from '../../../pubsub';
import { getDocument } from '../mutations/cacheUtils';

export default {
  /*
   * Listen for conversation changes like status, assignee, read state
   */
  conversationChanged: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('conversationChanged'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationChanged.conversationId === variables._id;
      }
    )
  },

  /*
   * Listen for new message insertion
   */
  conversationMessageInserted: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('conversationMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return (
          payload.conversationMessageInserted.conversationId === variables._id
        );
      }
    )
  },

  /*
   * Show typing while waiting Bot response
   */
  conversationBotTypingStatus: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('conversationBotTypingStatus'),
      async (payload, variables) => {
        return (
          payload.conversationBotTypingStatus.conversationId === variables._id
        );
      }
    )
  },

  /*
   * Admin is listening for this subscription to show typing notification
   */
  conversationClientTypingStatusChanged: {
    subscribe: withFilter(
      () =>
        graphqlPubsub.asyncIterator('conversationClientTypingStatusChanged'),
      async (payload, variables) => {
        return (
          payload.conversationClientTypingStatusChanged.conversationId ===
          variables._id
        );
      }
    )
  },

  /*
   * Admin is listening for this subscription to show unread notification
   */
  conversationClientMessageInserted: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('conversationClientMessageInserted'),
      async (payload, variables) => {
        const message = payload.conversationClientMessageInserted;

        const conversation = await Conversations.findOne(
          { _id: message.conversationId },
          { integrationId: 1 }
        );

        if (!conversation) {
          return false;
        }

        const integration = await getDocument('integrations', {
          _id: conversation.integrationId
        });

        if (!integration) {
          return false;
        }

        const availableChannelsCount = await Channels.countDocuments({
          integrationIds: { $in: [integration._id] },
          memberIds: { $in: [variables.userId] }
        });

        return availableChannelsCount > 0;
      }
    )
  },

  /*
   * Widget is listening for this subscription to show unread notification
   */
  conversationAdminMessageInserted: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('conversationAdminMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return (
          payload.conversationAdminMessageInserted.customerId ===
          variables.customerId
        );
      }
    )
  },

  /*
   * Integrations api is listener
   */
  conversationExternalIntegrationMessageInserted: {
    subscribe: () =>
      graphqlPubsub.asyncIterator(
        'conversationExternalIntegrationMessageInserted'
      )
  }
};
