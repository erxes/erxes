const chats = `
  query chats {
    chats {
      _id
      lastChatMessage {
        _id
        content
      }
      createdDate
    }
  }
`;

export default {
  chats
};
