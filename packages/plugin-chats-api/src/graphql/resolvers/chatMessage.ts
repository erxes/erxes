export default {
  async createdUser(chatMessage) {
    return (
      chatMessage.createdBy && {
        __typename: 'User',
        _id: chatMessage.createdBy
      }
    );
  },

  async relatedMessage(chatMessage, {}, { models }) {
    if (!chatMessage.relatedId) {
      return null;
    }

    return models.ChatMessages.findOne({ _id: chatMessage.relatedId });
  }
};
