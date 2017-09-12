import { ConversationMessages, Customers, Integrations, Users, Tags } from '../../db/models';

export default {
  customer(conversation) {
    return Customers.findOne({ _id: conversation.customerId });
  },

  integration(conversation) {
    return Integrations.findOne({ _id: conversation.integrationId });
  },

  user(conversation) {
    return Users.findOne({ _id: conversation.userId });
  },

  assignedUser(conversation) {
    return Users.findOne({ _id: conversation.assignedUserId });
  },

  participatedUsers(conv) {
    return Users.find({
      _id: { $in: conv.participatedUserIds || [] },
    });
  },

  participatorCount(conv) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  messages(conv) {
    return ConversationMessages.find({ conversationId: conv._id }).sort({ createdAt: 1 });
  },

  tags(conv) {
    return Tags.find({ _id: { $in: conv.tagIds || [] } });
  },
};
