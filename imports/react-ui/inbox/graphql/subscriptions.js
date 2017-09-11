export const conversationUpdated = `
  subscription onConversationUpdated($conversationId: String!) {
    conversationUpdated(conversationId: $conversationId) {
      type
      message {
        _id
        content
        user {
          _id
          username
          details
        }
        customer {
          _id
          name
        }
      }
    }
  }
`;

export const conversationNotification = `
  subscription conversationNotification {
    conversationNotification
  }
`;
