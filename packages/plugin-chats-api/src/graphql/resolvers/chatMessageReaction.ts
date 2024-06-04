import { IChatMessageReaction } from '../../models/definitions/chat';

export default {
  async user(chatMessageReaction: IChatMessageReaction) {
    return (
      chatMessageReaction.userId && {
        __typename: 'User',
        _id: chatMessageReaction.userId,
      }
    );
  },
};
