import { gql } from "@apollo/client"
import { queries as teamQueries } from "common/team/graphql"

const allUsers = teamQueries.allUsers
const users = teamQueries.users

const chats = gql`
  query chats($type: ChatType, $limit: Int, $skip: Int, $searchValue: String) {
    chats(type: $type, limit: $limit, skip: $skip, searchValue: $searchValue) {
      list {
        _id
        name
        type
        isSeen
        isPinned
        isPinnedUserIds
        featuredImage
        muteUserIds
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
            position
            operatorPhone
          }
        }
      }
      totalCount
    }
  }
`

const chatsPinned = gql`
  query chatsPinned {
    chatsPinned {
      list {
        _id
        name
        type
        isSeen
        isPinned
        isPinnedUserIds
        featuredImage
        muteUserIds
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
            position
            operatorPhone
          }
        }
      }
      totalCount
    }
  }
`

const chatDetail = gql`
  query chatDetail($id: String!) {
    chatDetail(_id: $id) {
      _id
      name
      type
      isSeen
      featuredImage
      muteUserIds
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
        }
        branches {
          title
        }
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
`

const chatMessages = gql`
  query chatMessages($chatId: String, $limit: Int, $skip: Int, $isPinned: Boolean) {
    chatMessages(chatId: $chatId, limit: $limit, skip: $skip, isPinned: $isPinned) {
      list {
        _id
        content
        attachments
        isPinned
        createdUser {
          _id
          email
          details {
            avatar
            fullName
            position
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
              position
            }
          }
        }
        seenList {
          lastSeenMessageId
          user {
            _id
            details {
              avatar
            }
          }
        }
      }
      totalCount
    }
  }
`

const getChatIdByUserIds = gql`
  query getChatIdByUserIds($userIds: [String]) {
    getChatIdByUserIds(userIds: $userIds)
  }
`

const getUnreadChatCount = gql`
  query getUnreadChatCount {
    getUnreadChatCount
  }
`

export default {
  getUnreadChatCount,
  chatsPinned,
  users,
  allUsers,
  chats,
  chatDetail,
  chatMessages,
  getChatIdByUserIds,
}
