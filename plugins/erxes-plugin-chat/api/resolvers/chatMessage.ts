const chatMessageResolvers = [
  {
    type: 'ChatMessage',
    field: 'createdUser',
    handler: (chatMessage, {}, { models }) => {
      return models.Users.findOne({ _id: chatMessage.createdBy });
    }
  }
];

export default chatMessageResolvers;
