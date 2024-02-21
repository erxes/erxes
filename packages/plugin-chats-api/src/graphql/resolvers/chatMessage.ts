import { IContext } from '../../connectionResolver';

export default {
  async createdUser(chatMessage) {
    return (
      chatMessage.createdBy && {
        __typename: 'User',
        _id: chatMessage.createdBy,
      }
    );
  },

  async relatedMessage(chatMessage, {}, { models }) {
    if (!chatMessage.relatedId) {
      return null;
    }

    return models.ChatMessages.findOne({ _id: chatMessage.relatedId });
  },

  async reactions(chatMessage, {}, { models }: IContext) {
    return models.ChatMessageReactions.find({ chatMessageId: chatMessage._id });
  },
};
