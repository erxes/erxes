const chats = `
  query chats($type: ChatType, $limit: Int, $skip: Int) {
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
  query chatMessages($chatId: String, $limit: Int, $skip: Int) {
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

const getChatIdByUserIds = `
  query getChatIdByUserIds($userIds: [String]) {
    getChatIdByUserIds(userIds: $userIds)
  }
`;

export default {
  chats,
  chatMessages,
  getChatIdByUserIds
};
