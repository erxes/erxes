const chatSubscriptions = {
  chatMessageInserted: async (payload, variables) => {
    return payload.chatId === variables.chatId;
  },

  chatInserted: async (payload, variables) => {
    return payload.userId === variables.userId;
  },

  chatUnreadCountChanged: async (payload, variables) => {
    return payload.userId === variables.userId;
  },
};

export default chatSubscriptions;
