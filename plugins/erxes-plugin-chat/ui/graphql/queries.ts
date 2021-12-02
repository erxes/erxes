const chats = `
  query chats($limit: Int, $skip: Int) {
    chats(limit: $limit, skip: $skip) {
      list {
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
      totalCount
    }
  }
`;

const chatMessages = `
  query chatMessages($chatId: String!, $limit: Int, $skip: Int) {
    chatMessages(chatId: $chatId, limit: $limit, skip: $skip) {
      list {
        _id
        content
        createdUser {
          _id
          email
        }
        createdAt
      }
      totalCount
    }
  }
`;

export default {
  chats,
  chatMessages
};
