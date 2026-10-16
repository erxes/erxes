import { IMessageDocument } from '@/inbox/@types/conversationMessages';

export default {
  user(message: IMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId };
  },
};
