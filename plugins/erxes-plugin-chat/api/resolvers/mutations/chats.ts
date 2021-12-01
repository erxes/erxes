const chatMutations = [
  {
    name: 'chatAdd',
    handler: async (_root, doc, { user, models }) => {
      return models.Chats.createChat(models, doc, user._id);
    }
  },
  {
    name: 'chatEdit',
    handler: async (_root, { _id, ...doc }, { models }) => {
      return models.Chats.updateChat(models, _id, doc);
    }
  },
  {
    name: 'chatRemove',
    handler: async (_root, { _id }, { models }) => {
      await models.ChatMessages.deleteMany({ chatId: _id });

      return models.Chats.removeChat(models, _id);
    }
  },
  {
    name: 'chatMessageAdd',
    handler: async (_root, args, { models, user }) => {
      const doc = { ...args };

      if (!doc.chatId) {
        const chat = await models.Chats.createChat(
          models,
          { name: doc.content },
          user._id
        );

        doc.chatId = chat._id;
      }

      return models.ChatMessages.createChatMessage(models, doc, user._id);
    }
  },
  {
    name: 'chatMessageRemove',
    handler: (_root, { _id }, { models }) => {
      return models.ChatMessages.removeChatMessage(models, _id);
    }
  }
];

export default chatMutations;
