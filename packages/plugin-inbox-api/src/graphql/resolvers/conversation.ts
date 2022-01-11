import { Customers, Tags, Users } from '../../apiCollections';
import { ConversationMessages, Integrations } from '../../models';
import { IConversationDocument } from '../../models/definitions/conversations';
import { IContext } from '@erxes/api-utils';

export default {
  /**
   * Get idle time in minutes
   */
  idleTime(conversation: IConversationDocument) {
    const now = new Date();

    return (now.getTime() - conversation.updatedAt.getTime()) / (1000 * 60);
  },

  customer(conversation: IConversationDocument, _, { dataLoaders }: IContext) {
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
    }).toArray();
  },

  participatorCount(conv: IConversationDocument) {
    return (conv.participatedUserIds && conv.participatedUserIds.length) || 0;
  },

  messages(conv: IConversationDocument, _, { dataLoaders }: IContext) {
    return ConversationMessages.find({ conversationId: conv._id });
  },

  async tags(conv: IConversationDocument, _, { dataLoaders }: IContext) {
    return Tags.find({ _id: { $in: conv.tagIds|| []}}).toArray();
  },
};