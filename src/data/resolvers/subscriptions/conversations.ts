import { withFilter } from 'apollo-server-express';
import { Channels, Conversations, Integrations } from '../../../db/models';
import pubsub from './pubsub';

export default {
  /*
   * Listen for conversation changes like status, assignee, read state
   */
  conversationChanged: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationChanged'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationChanged.conversationId === variables._id;
      },
    ),
  },

  /*
   * Listen for new message insertion
   */
  conversationMessageInserted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationMessageInserted.conversationId === variables._id;
      },
    ),
  },

  /*
   * Admin is listening for this subscription to show unread notification
   */
  conversationClientMessageInserted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationClientMessageInserted'),
      async (payload, variables) => {
        const message = payload.conversationClientMessageInserted;
        const conversation = await Conversations.findOne({ _id: message.conversationId }, { integrationId: 1 });

        if (!conversation) {
          return false;
        }

        const integration = await Integrations.findOne({ _id: conversation.integrationId }, { _id: 1 });

        if (!integration) {
          return false;
        }

        const availableChannelsCount = await Channels.count({
          integrationIds: { $in: [integration._id] },
          memberIds: { $in: [variables.userId] },
        });

        return availableChannelsCount > 0;
      },
    ),
  },

  /*
   * Widget is listening for this subscription to show unread notification
   */
  conversationAdminMessageInserted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator('conversationAdminMessageInserted'),
      // filter by conversationId
      (payload, variables) => {
        return payload.conversationAdminMessageInserted.customerId === variables.customerId;
      },
    ),
  },
};
