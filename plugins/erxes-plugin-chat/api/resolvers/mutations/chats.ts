const chatMutations = [
  {
    name: 'chatsAdd',
    handler: async (_root, doc, { user, models }) => {
      const chat = await models.Chats.createChat(models, doc, user._id);

      await models.ChatMessages.createChatMessage(
        models,
        {
          content: doc.content,
          chatId: chat._id
        },
        user._id
      );

      return chat;
    }
  },
  {
    name: 'chatMessagesRemove',
    handler: (_root, { _id }, { models }) => {
      return models.ChatMessages.removeChatMessage(models, _id);
    }
  }
];

export default chatMutations;
