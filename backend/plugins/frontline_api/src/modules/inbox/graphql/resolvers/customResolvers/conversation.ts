import { IConversationDocument } from '~/modules/inbox/@types/conversations';

import { IContext } from '~/connectionResolvers';

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

  async messages(conv: IConversationDocument, _, { models }: IContext) {
    const messages = await models.ConversationMessages.find({
      conversationId: conv._id,
    });
    return messages.filter((message) => message);
  },

  async tags(conv: IConversationDocument) {
    return (conv.tagIds || []).map((_id) => ({ __typename: 'Tag', _id }));
  },
};
