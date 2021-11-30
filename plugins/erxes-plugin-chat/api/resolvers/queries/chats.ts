const chatQueries = [
  {
    name: 'chats',
    handler: async (_root, _doc, { models }) => {
      return models.Chats.find();
    }
  },
  {
    name: 'chatDetail',
    handler: async (_root, { _id }, { models }) => {
      return models.Chats.findOne({ _id });
    }
  }
];

export default chatQueries;
