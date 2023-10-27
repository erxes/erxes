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

const chatInserted = `
  subscription chatInserted($userId: String!) {
    chatInserted(userId: $userId) {
      _id
    }
  }
`

export default {
  chatMessageInserted,
  chatInserted,
}
