const ChatMessage = {
  async createdUser(chatMessage, {}, { coreModels }) {
    return coreModels.Users.findOne({ _id: chatMessage.createdBy });
  },

  async relatedMessage(chatMessage, {}, { models }) {
    if (!chatMessage.relatedId) {
      return null;
    }

    return models.ChatMessages.findOne({ _id: chatMessage.relatedId });
  },
};

export default ChatMessage;
