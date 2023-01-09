const chats = `
  query chats($type: ChatType, $limit: Int, $skip: Int) {
    chats(type: $type, limit: $limit, skip: $skip) {
      list {
        _id
        name
        type
        isSeen
        lastMessage {
          content
          createdAt
          createdUser {
            _id
          }
          seenList {
            seenDate
            user {
              _id
            }
            lastSeenMessageId
          }
        }
        createdUser {
          _id
          email
          details {
            avatar
            description
            fullName
            operatorPhone
          }
        }
        createdAt
        participantUsers {
          _id
          email
          details {
            avatar
            description
            fullName
            operatorPhone
          }
        }
      }
      totalCount
    }
  }
`;

const chatDetail = `
  query chatDetail($id: String!) {
    chatDetail(_id: $id) {
      _id
      name
      type
      isSeen
      lastMessage {
        createdAt
        content
      }
      createdUser {
        _id
        email
        details {
          avatar
          description
          fullName
          operatorPhone
        }
      }
      createdAt
      participantUsers {
        _id
        email
        isAdmin
        details {
          avatar
          description
          fullName
          operatorPhone
        }
      }
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
          details {
            avatar
          }
        }
        createdAt
        seenList {
          lastSeenMessageId
        }
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
  chatDetail,
  chatMessages,
  getChatIdByUserIds
};
