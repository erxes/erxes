const chatSubscriptions = [
  {
    name: 'chatMessageInserted',
    handler: async (payload, variables) => {
      return payload.chatId === variables.chatId;
    }
  },
  {
    name: 'chatInserted',
    handler: async (payload, variables) => {
      return payload.userId === variables.userId;
    }
  },
  {
    name: 'chatUnreadCountChanged',
    handler: async (payload, variables) => {
      return payload.userId === variables.userId;
    }
  }
];

export default chatSubscriptions;
