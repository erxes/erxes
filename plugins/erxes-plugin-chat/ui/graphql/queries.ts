const chats = `
  query chats($limit: Int, $skip: Int) {
    chats(limit: $limit, skip: $skip) {
      _id
      name
      lastChatMessage {
        _id
        content
      }
      createdUser {
        _id
        email
      }
      createdAt
    }
  }
`;

const chatMessages = `
  query chatMessages($chatId: String!, $limit: Int, $skip: Int) {
    chatMessages(chatId: $chatId, limit: $limit, skip: $skip) {
      _id
      content
      createdUser {
        _id
        email
      }
      createdAt
    }
  }
`;

export default {
  chats,
  chatMessages
};
