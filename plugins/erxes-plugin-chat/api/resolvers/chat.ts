const chatResolvers = [
  {
    type: 'Chat',
    field: 'lastMessage',
    handler: (chat, {}, { models }) => {
      return models.ChatMessages.findOne({ chatId: chat._id });
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
    handler: async (chat, {}, { models, user }) => {
      const participantIdsExceptMe = (chat.participantIds || []).filter(
        id => id !== user._id
      );

      return models.Users.find({
        _id: { $in: participantIdsExceptMe }
      });
    }
  }
];

export default chatResolvers;
