import { ConversationMessages, Customers, Integrations, Tags, Users } from '../../db/models';
import { IConversationDocument } from '../../db/models/definitions/conversations';

export default {
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
      _id: { $in: conv.participatedUserIds || [] },
    });
  },

  participatorCount(conv: IConversationDocument) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  messages(conv: IConversationDocument) {
    return ConversationMessages.find({ conversationId: conv._id }).sort({
      createdAt: 1,
    });
  },

  tags(conv: IConversationDocument) {
    return Tags.find({ _id: { $in: conv.tagIds || [] } });
  },
};
