export default `
  subscription onConversationMessageAdded($conversationId: String!) {
    conversationMessageAdded(conversationId: $conversationId) {
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
`;
