import { IConversationDocument } from '../../models/definitions/conversations';
import { MESSAGE_TYPES } from '../../models/definitions/constants';
import {
  sendCallsMessage,
  sendCloudflareCallsMessage,
  sendIntegrationsMessage,
} from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { debugError } from '@erxes/api-utils/src/debuggers';

export default {
  /**
   * Get idle time in minutes
   */
  idleTime(conversation: IConversationDocument) {
    const now = new Date();

    return (
      (now.getTime() - (conversation.updatedAt || now).getTime()) / (1000 * 60)
    );
  },

  customer(conversation: IConversationDocument) {
    return (
      conversation.customerId && {
        __typename: 'Customer',
        _id: conversation.customerId,
      }
    );
  },

  async integration(
    conversation: IConversationDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Integrations.findOne({
      _id: conversation.integrationId,
    });
  },

  user(conversation: IConversationDocument) {
    return (
      conversation.userId && { __typename: 'User', _id: conversation.userId }
    );
  },

  assignedUser(conversation: IConversationDocument) {
    return (
      conversation.assignedUserId && {
        __typename: 'User',
        _id: conversation.assignedUserId,
      }
    );
  },

  participatedUsers(conv: IConversationDocument) {
    return (conv.participatedUserIds || []).map((_id) => ({
      __typename: 'User',
      _id,
    }));
  },

  readUsers(conv: IConversationDocument) {
    return (conv.readUserIds || []).map((_id) => ({
      __typename: 'User',
      _id,
    }));
  },
  participatorCount(conv: IConversationDocument) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  async messages(conv: IConversationDocument, _, { dataLoaders }: IContext) {
    const messages =
      await dataLoaders.conversationMessagesByConversationId.load(conv._id);
    return messages.filter((message) => message);
  },

  async callProAudio(
    conv: IConversationDocument,
    _args,
    { user, models, subdomain }: IContext,
  ) {
    const integration =
      (await models.Integrations.findOne({
        _id: conv.integrationId,
      })) || ({} as any);

    if (integration && integration.kind !== 'callpro') {
      return null;
    }

    if (user.isOwner || user._id === conv.assignedUserId) {
      try {
        const response = await sendIntegrationsMessage({
          subdomain,
          action: 'getCallproAudio',
          data: {
            erxesApiId: conv._id,
            integrationId: integration._id,
          },
          isRPC: true,
        });

        return response ? response.audioSrc : '';
      } catch (e) {
        debugError(e);
        return null;
      }
    }

    return null;
  },

  async tags(conv: IConversationDocument) {
    return (conv.tagIds || []).map((_id) => ({ __typename: 'Tag', _id }));
  },

  async videoCallData(
    conversation: IConversationDocument,
    _args,
    { models, subdomain }: IContext,
  ) {
    const message = await models.ConversationMessages.findOne({
      conversationId: conversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL,
    }).lean();

    if (!message) {
      return null;
    }

    try {
      const response = await sendIntegrationsMessage({
        subdomain,
        action: 'getDailyActiveRoom',
        data: {
          erxesApiConversationId: conversation._id,
        },
        isRPC: true,
      });

      return response;
    } catch (e) {
      debugError(e);
      return null;
    }
  },
  async callHistory(
    conversation: IConversationDocument,
    _args,
    { models, subdomain }: IContext,
  ) {
    const integration =
      (await models.Integrations.findOne({
        _id: conversation.integrationId,
      })) || ({} as any);

    if (integration && integration.kind !== 'calls') {
      return null;
    }

    // if (user.isOwner || user._id === conv.assignedUserId) {
    try {
      const response = await sendCallsMessage({
        subdomain,
        action: 'getCallHistory',
        data: {
          erxesApiConversationId: conversation._id,
        },
        isRPC: true,
      });

      return response ? response : '';
    } catch (e) {
      debugError(e);
      return null;
    }
    // }

    return null;
  },

  async cloudflareCallsHistory(
    conversation: IConversationDocument,
    _args,
    { models, subdomain }: IContext,
  ) {
    const integration =
      (await models.Integrations.findOne({
        _id: conversation.integrationId,
      })) || ({} as any);

    if (
      integration &&
      !['cloudflarecalls', 'messenger'].includes(integration.kind)
    ) {
      return null;
    }

    try {
      const response = await sendCloudflareCallsMessage({
        subdomain,
        action: 'getCallHistory',
        data: {
          erxesApiConversationId: conversation._id,
        },
        isRPC: true,
      });

      return response ? response : '';
    } catch (e) {
      debugError(e);
      return null;
    }
  },
};
