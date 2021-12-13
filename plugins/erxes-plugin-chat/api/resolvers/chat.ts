const chatResolvers = [
  {
    type: 'Chat',
    field: 'lastMessage',
    handler: (chat, {}, { models }) => {
      return models.ChatMessages.findOne({ chatId: chat._id }).sort({
        createdAt: -1
      });
    }
  },
  {
    type: 'Chat',
    field: 'createdUser',
    handler: (chat, {}, { models }) => {
      return models.Users.findOne({ _id: chat.createdBy });
    }
  },
  {
    type: 'Chat',
    field: 'participantUsers',
    handler: async (chat, {}, { models }) => {
      return models.Users.find({
        _id: { $in: chat.participantIds || [] }
      });
    }
  }
];

export default chatResolvers;
