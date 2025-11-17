import { IMessageDocument } from '@/inbox/@types/conversationMessages';

export default {
  user(message: IMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId };
  },

  customer(message: IMessageDocument) {
    return (
      message.customerId && { __typename: 'Customer', _id: message.customerId }
    );
  },
};
