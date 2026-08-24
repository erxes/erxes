import { IMessageDocument } from '@/inbox/@types/conversationMessages';

export default {
  reactions(message: IMessageDocument) {
    return (message.reactions || []).map((reaction) => ({
      emoji: reaction.emoji,
      userIds: reaction.userIds || [],
    }));
  },

  pinnedByIds(message: IMessageDocument) {
    return message.pinnedByIds || [];
  },

  user(message: IMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId };
  },

  customer(message: IMessageDocument) {
    return (
      message.customerId && { __typename: 'Customer', _id: message.customerId }
    );
  },
};
