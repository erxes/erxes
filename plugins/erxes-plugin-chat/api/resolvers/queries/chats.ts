const chatQueries = [
  {
    name: 'chats',
    handler: async (_root, { type, limit, skip }, { models, user }) => {
      const filter: any = { type, participantIds: { $in: [user._id] } };

      return {
        list: await models.Chats.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(limit || 10),
        totalCount: await models.Chats.find(filter).countDocuments()
      };
    }
  },
  {
    name: 'chatDetail',
    handler: async (_root, { _id }, { models }) => {
      return models.Chats.findOne({ _id });
    }
  },
  {
    name: 'chatMessages',
    handler: async (_root, { chatId }, { models }) => {
      return {
        list: await models.ChatMessages.find({ chatId }).sort({ createdAt: 1 }),
        totalCount: await models.ChatMessages.find({ chatId }).countDocuments()
      };
    }
  },
  {
    name: 'getChatIdByUserIds',
    handler: async (_root, { userIds }, { models, user }) => {
      const participantIds = [...(userIds || [])];

      if (!participantIds.includes(user._id)) {
        participantIds.push(user._id);
      }

      let chat = await models.Chats.findOne({
        type: 'direct',
        participantIds: { $all: participantIds, $size: participantIds.length }
      });

      if (!chat) {
        chat = await models.Chats.createChat(models, {
          name: 'Direct chat',
          participantIds,
          type: 'direct'
        });
      }

      return chat._id;
    }
  }
];

export default chatQueries;
