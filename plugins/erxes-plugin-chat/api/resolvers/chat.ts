const chatResolvers = [
  {
    type: 'Chat',
    field: 'lastChatMessage',
    handler: (chat, {}, { models }) => {
      return models.ChatMessages.findOne({ chatId: chat._id }).sort({
        createdBy: -1
      });
    }
  },
  {
    type: 'Chat',
    field: 'createdUser',
    handler: (chat, {}, { models }) => {
      return models.Users.findOne({ _id: chat.createdBy });
    }
  }
];

export default chatResolvers;
