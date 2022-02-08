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
      const users = await models.Users.find({
        _id: { $in: chat.participantIds || [] }
      }).lean();

      return users.map(user => ({
        ...user,
        isAdmin: (chat.adminIds || []).includes(user._id)
      }));
    }
  }
];

export default chatResolvers;
