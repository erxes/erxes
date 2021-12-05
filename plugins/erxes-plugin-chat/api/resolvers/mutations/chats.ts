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
    handler: (_root, { _id }, { models }) => {
      return models.Chats.removeChat(models, _id);
    }
  },
  {
    name: 'chatMessageAdd',
    handler: async (_root, args, { models, user }) => {
      if (!args.content) {
        throw new Error('Content is required');
      }

      const doc = { ...args };

      if (!doc.chatId) {
        if (
          !doc.participantIds ||
          (doc.participantIds && doc.participantIds.length === 0)
        ) {
          throw new Error('Please choose at least one participant');
        }

        const participantIds = (doc.participantIds || []).concat(user._id);

        const chat = await models.Chats.findOne({
          participantIds: { $all: participantIds, $size: participantIds.length }
        });

        if (chat) {
          doc.chatId = chat._id;
        } else {
          const createdChat = await models.Chats.createChat(
            models,
            { name: doc.content, participantIds },
            user._id
          );

          doc.chatId = createdChat._id;
        }
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
