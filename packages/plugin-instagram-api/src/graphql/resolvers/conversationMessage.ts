import { IConversationMessageDocument } from '../../models/definitions/conversationMessages';

export default {
  user(message: IConversationMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId };
  },

  customer(message: IConversationMessageDocument) {
    return (
      message.customerId && { __typename: 'Customer', _id: message.customerId }
    );
  }
};
