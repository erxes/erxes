const chatMessageInserted = `
  subscription chatMessageInserted($chatId: String!) {
    chatMessageInserted(chatId: $chatId) {
      _id
      content
      attachments
      mentionedUserIds
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
`;

const chatInserted = `
  subscription chatInserted($userId: String!) {
    chatInserted(userId: $userId) {
      _id
    }
  }
`;

const chatUnreadCountChanged = `
subscription chatUnreadCountChanged($userId: String!){
  chatUnreadCountChanged(userId: $userId)
}`;

export default {
  chatMessageInserted,
  chatInserted,
  chatUnreadCountChanged
};
