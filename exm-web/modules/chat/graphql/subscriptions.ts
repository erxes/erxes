import { gql } from "@apollo/client"

const chatMessageInserted = gql`
  subscription chatMessageInserted($chatId: String!) {
    chatMessageInserted(chatId: $chatId) {
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
  }
`

const chatInserted = gql`
  subscription chatInserted($userId: String!) {
    chatInserted(userId: $userId) {
      _id
    }
  }
`

const chatUnreadCountChanged = gql`
  subscription chatUnreadCountChanged($userId: String!) {
    chatUnreadCountChanged(userId: $userId)
  }
`

export default { chatUnreadCountChanged, chatMessageInserted, chatInserted }
