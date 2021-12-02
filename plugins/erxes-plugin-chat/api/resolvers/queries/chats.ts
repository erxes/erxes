const chatQueries = [
  {
    name: 'chats',
    handler: async (_root, { type, limit, skip }, { models, user }) => {
      const filter: any = {};

      switch (type) {
        case 'direct': {
          filter.participantIds = { $size: 2, $in: user._id };
        }
        default:
      }

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
    handler: async (
      _root,
      { userIds, chatId, limit, skip },
      { models, user }
    ) => {
      if (!chatId) {
        if (!userIds || (userIds && userIds.length === 0)) {
          return {
            list: [],
            totalCount: 0
          };
        }

        const participantIds = [user._id, ...userIds];

        const chat = await models.Chats.findOne({
          participantIds: { $all: participantIds, $size: participantIds.length }
        });

        if (!chat) {
          return {
            list: [],
            totalCount: 0
          };
        }

        chatId = chat._id;
      }

      return {
        list: models.ChatMessages.find({ chatId })
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(limit || 10),
        totalCount: await models.ChatMessages.find({ chatId }).countDocuments()
      };
    }
  }
];

export default chatQueries;
