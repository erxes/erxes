const chatMessageResolvers = [
  {
    type: 'ChatMessage',
    field: 'createdUser',
    handler: (chatMessage, {}, { models }) => {
      return models.Users.findOne({ _id: chatMessage.createdBy });
    }
  },
  {
    type: 'ChatMessage',
    field: 'relatedMessage',
    handler: (chatMessage, {}, { models }) => {
      if (!chatMessage.relatedId) {
        return null;
      }

      return models.ChatMessages.findOne({ _id: chatMessage.relatedId });
    }
  }
];

export default chatMessageResolvers;
