import { queries as teamQueries } from '@erxes/ui/src/team/graphql';

const allUsers = teamQueries.allUsers;

const chats = `
  query chats($type: ChatType, $limit: Int, $skip: Int) {
    chats(type: $type, limit: $limit, skip: $skip) {
      list {
        _id
        name
        type
        isSeen
        isPinned
        isPinnedUserIds
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
          attachments
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
            position
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
        employeeId
        isAdmin
        departments {
          title
        },
        branches {
          title
        },
        details {
          avatar
          description
          fullName
          operatorPhone
          position
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
        attachments
        createdUser {
          _id
          email
          details {
            avatar
            fullName
          }
        }
        createdAt
        relatedMessage {
          _id
          content
          createdUser {
            _id
            email
            details {
              avatar
              fullName
            }
          }
        }
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

const getUnreadChatCount = `
  query getUnreadChatCount{
    getUnreadChatCount
  }

`;
const notificationsGetConfigurations = `
  query notificationsGetConfigurations {
          notificationsGetConfigurations {
            _id
            notifType
            isAllowed
          }
        }
`;

export default {
  chats,
  chatDetail,
  chatMessages,
  getChatIdByUserIds,
  getUnreadChatCount,
  notificationsGetConfigurations,
  allUsers
};
