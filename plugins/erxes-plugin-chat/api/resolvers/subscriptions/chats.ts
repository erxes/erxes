const chatSubscriptions = [
  {
    name: 'chatMessageInserted',
    handler: async (payload, variables) => {
      return payload.userId === variables.userId;
    }
  }
];

export default chatSubscriptions;
