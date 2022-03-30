const ChatMessage = {
  async createdUser(chatMessage, {}, { models }) {
    const user = models.Users.findOne({ _id: chatMessage.createdBy });
    return user;
  },

  async relatedMessage(chatMessage, {}, { models }) {
    if (!chatMessage.relatedId) {
      return null;
    }

    return models.ChatMessages.findOne({ _id: chatMessage.relatedId });
  },
};

export default ChatMessage;
