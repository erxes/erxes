const detail = `
  query {name}($conversationId: String!) {
      {name}ConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query {name}Accounts {
    {name}Accounts 
  }
`;

export default {
  detail,
  accounts
};
