import { debug } from '../../configs';
import { getDocument } from '../../cacheUtils';
import { IConversationDocument } from '../../models/definitions/conversations';
import { IContext } from '@erxes/api-utils/src';
import { ConversationMessages } from '../../models';
import { MESSAGE_TYPES } from '../../models/definitions/constants';
import { sendRPCMessage } from '../../messageBroker';

export default {
  /**
   * Get idle time in minutes
   */
  idleTime(conversation: IConversationDocument) {
    const now = new Date();

    return (now.getTime() - conversation.updatedAt.getTime()) / (1000 * 60);
  },

  customer(conversation: IConversationDocument) {
    return conversation.customerId && { __typename: 'Customer', _id: conversation.customerId }
  },

  integration(conversation: IConversationDocument) {
    return getDocument('integrations', { _id: conversation.integrationId });
  },

  user(conversation: IConversationDocument) {
    return conversation.userId && { __typename: 'User', _id: conversation.userId }
  },

  assignedUser(conversation: IConversationDocument) {
    return conversation.assignedUserId && { __typename: 'User', _id: conversation.assignedUserId }
  },

  participatedUsers(conv: IConversationDocument) {
    return (conv.participatedUserIds || []).map((_id) => ({ __typename: 'User', _id }))
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
      const response = await sendRPCMessage('integrations:rpc_queue:getFacebookPost', {
          erxesApiId: conv._id,
      })

      return response;
    } catch (e) {
      debug.error(e);
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
        const response = await sendRPCMessage('integrations:rpc_queue:getCallproAudio', {
          erxesApiId: conv._id,
          integrationId: integration._id
        })

        return response ? response.audioSrc : '';
      } catch (e) {
        debug.error(e);
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
      const response = await sendRPCMessage('integrations:rpc_queue:getDailyActiveRoom', {
        erxesApiConversationId: conversation._id
      })

      return response;
    } catch (e) {
      debug.error(e);
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