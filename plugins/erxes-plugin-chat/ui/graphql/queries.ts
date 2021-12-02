const chats = `
  query chats($type: ChatType!, $limit: Int, $skip: Int) {
    chats(type: $type, limit: $limit, skip: $skip) {
      list {
        _id
        name
        createdUser {
          _id
          email
        }
        createdAt
        participantUsers {
          _id
          email
          details {
            fullName
          }
        }
      }
      totalCount
    }
  }
`;

const chatMessages = `
  query chatMessages($chatId: String, $userIds: [String], $limit: Int, $skip: Int) {
    chatMessages(chatId: $chatId, userIds: $userIds, limit: $limit, skip: $skip) {
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
