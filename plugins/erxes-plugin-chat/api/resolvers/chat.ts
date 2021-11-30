const chatResolvers = [
  {
    type: 'Chat',
    field: 'lastChatMessage',
    handler: (chat, {}, { models }) => {
      return models.ChatMessages.findOne({ chatId: chat._id }).sort({
        createdBy: -1
      });
    }
  }
];

export default chatResolvers;
