import {
  ConversationMessages,
  Customers,
  Integrations,
  Tags,
  Users
} from '../../db/models';
import { MESSAGE_TYPES } from '../../db/models/definitions/constants';
import { IConversationDocument } from '../../db/models/definitions/conversations';
import { debugError } from '../../debuggers';
import { IContext } from '../types';

export default {
  /**
   * Get idle time in minutes
   */
  idleTime(conversation: IConversationDocument) {
    const now = new Date();

    return (now.getTime() - conversation.updatedAt.getTime()) / (1000 * 60);
  },

  customer(conversation: IConversationDocument) {
    return Customers.findOne({ _id: conversation.customerId });
  },

  integration(conversation: IConversationDocument) {
    return Integrations.findOne({ _id: conversation.integrationId });
  },

  user(conversation: IConversationDocument) {
    return Users.findOne({ _id: conversation.userId });
  },

  assignedUser(conversation: IConversationDocument) {
    return Users.findOne({ _id: conversation.assignedUserId });
  },

  participatedUsers(conv: IConversationDocument) {
    return Users.find({
      _id: { $in: conv.participatedUserIds || [] }
    });
  },

  participatorCount(conv: IConversationDocument) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  messages(conv: IConversationDocument) {
    return ConversationMessages.find({ conversationId: conv._id }).sort({
      createdAt: 1
    });
  },

  async facebookPost(
    conv: IConversationDocument,
    _args,
    { dataSources }: IContext
  ) {
    const integration = await Integrations.findOne({
      _id: conv.integrationId
    }).lean();

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
    const integration = await Integrations.findOne({
      _id: conv.integrationId
    }).lean();

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

  tags(conv: IConversationDocument) {
    return Tags.find({ _id: { $in: conv.tagIds || [] } });
  },

  async videoCallData(
    conversation: IConversationDocument,
    _args,
    { dataSources }: IContext
  ) {
    const message = await ConversationMessages.findOne({
      conversationId: conversation._id,
      contentType: MESSAGE_TYPES.VIDEO_CALL
    });

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

  async productBoardLink(
    conversation: IConversationDocument,
    _args,
    { dataSources }: IContext
  ) {
    try {
      const response = await dataSources.IntegrationsAPI.fetchApi(
        '/productBoard/note',
        {
          erxesApiId: conversation._id
        }
      );
      return response;
    } catch (e) {
      debugError(e);
      return null;
    }
  },

  async isFacebookTaggedMessage(conversation: IConversationDocument) {
    const integration = await Integrations.findOne({
      _id: conversation.integrationId
    }).lean();

    if (integration && integration.kind !== 'facebook-messenger') {
      return false;
    }

    const message = await ConversationMessages.find({
      conversationId: conversation._id,
      customerId: { $exists: true },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(1);

    if (message.length && message.length >= 1) {
      return false;
    }

    return true;
  }
};
