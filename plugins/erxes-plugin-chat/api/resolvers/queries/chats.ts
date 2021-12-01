const chatQueries = [
  {
    name: 'chats',
    handler: async (_root, { limit, skip }, { models }) => {
      return models.Chats.find()
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit || 10);
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
    handler: async (_root, { chatId, limit, skip }, { models }) => {
      return models.ChatMessages.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit || 10);
    }
  }
];

export default chatQueries;
