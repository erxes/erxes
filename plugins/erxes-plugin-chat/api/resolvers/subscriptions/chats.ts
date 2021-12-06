const chatSubscriptions = [
  {
    name: 'chatMessageInserted',
    handler: async (payload, variables) => {
      return payload.chatMessageInserted.chatId === variables.chatId;
    }
  }
];

export default chatSubscriptions;
