import { debugError } from '../../debuggers';
import { getDocument } from '../../cacheUtils';
import { IConversationDocument } from '../../models/definitions/conversations';
import { IContext } from '@erxes/api-utils';
import { ConversationMessages } from '../../models';
import { MESSAGE_TYPES } from '../../models/definitions/constants';

export default {
  /**
   * Get idle time in minutes
   */
  idleTime(conversation: IConversationDocument) {
    const now = new Date();

    return (now.getTime() - conversation.updatedAt.getTime()) / (1000 * 60);
  },

  customer(conversation: IConversationDocument) {
    return conversation.customerId && { __type: 'Customer', _id: conversation.customerId }
  },

  integration(conversation: IConversationDocument) {
    return getDocument('integrations', { _id: conversation.integrationId });
  },

  user(conversation: IConversationDocument) {
    return conversation.userId && { __type: 'User', _id: conversation.userId }
  },

  assignedUser(conversation: IConversationDocument) {
    return conversation.assignedUserId && { __type: 'User', _id: conversation.assignedUserId }
  },

  participatedUsers(conv: IConversationDocument) {
    return (conv.participatedUserIds || []).map((_id) => ({ __type: 'User', _id }))
  },

  participatorCount(conv: IConversationDocument) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  async messages(conv: IConversationDocument, _, { dataLoaders }: IContext) {
    const messages = await dataLoaders.conversationMessagesByConversationId.load(
      conv._id
    );
    return messages.filter(message => message);
  },

  async facebookPost(
    conv: IConversationDocument,
    _args,
    { dataSources }: IContext
  ) {
    const integration =
      (await getDocument('integrations', {
        _id: conv.integrationId
      })) || {};

    if (integration && integration.kind !== 'facebook-post') {
      return null;
    }

    try {
      const response = await dataSources.IntegrationsAPI.fetchApi(
        '/facebook/get-post',
        {
          erxesApiId: conv._id,
          integrationId: integration._id
        }
      );

      return response;
    } catch (e) {
      debugError(e);
      return null;
    }
  },

  async callProAudio(
    conv: IConversationDocument,
    _args,
    { dataSources, user }: IContext
  ) {
    const integration =
      (await getDocument('integrations', {
        _id: conv.integrationId
      })) || {};

    if (integration && integration.kind !== 'callpro') {
      return null;
    }

    if (user.isOwner || user._id === conv.assignedUserId) {
      try {
        const response = await dataSources.IntegrationsAPI.fetchApi(
          '/callpro/get-audio',
          {
            erxesApiId: conv._id,
            integrationId: integration._id
          }
        );

        return response ? response.audioSrc : '';
      } catch (e) {
        debugError(e);
        return null;
      }
    }

    return null;
  },

  async tags(conv: IConversationDocument) {
    return (conv.tagIds || []).map((_id) => ({ __type: 'Tag', _id }));
  },

  async videoCallData(
    conversation: IConversationDocument,
    _args,
    { dataSources }: IContext
  ) {
    const message = await ConversationMessages.findOne({
      conversationId: conversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL
    }).lean();

    if (!message) {
      return null;
    }

    try {
      const response = await dataSources.IntegrationsAPI.fetchApi(
        '/daily/get-active-room',
        {
          erxesApiConversationId: conversation._id
        }
      );

      return response;
    } catch (e) {
      debugError(e);
      return null;
    }
  },

  async isFacebookTaggedMessage(conversation: IConversationDocument) {
    const integration =
      (await getDocument('integrations', {
        _id: conversation.integrationId
      })) || {};

    if (integration && integration.kind !== 'facebook-messenger') {
      return false;
    }

    const message = await ConversationMessages.find({
      conversationId: conversation._id,
      customerId: { $exists: true },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .limit(1)
      .lean();

    if (message.length && message.length >= 1) {
      return false;
    }

    return true;
  }
};