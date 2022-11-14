const detail = `
  query {name}($conversationId: String!) {
      {name}ConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

export default {
  detail
};
