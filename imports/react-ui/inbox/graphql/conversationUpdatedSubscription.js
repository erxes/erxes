export default `
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
