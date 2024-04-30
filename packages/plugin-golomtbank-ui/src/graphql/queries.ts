const detail = `
  query golomtbank($conversationId: String!) {
      golomtbankConversationDetail(conversationId: $conversationId) {
          _id
          mailData
      }
  }
`;

const accounts = `
  query golomtbankAccounts {
    golomtbankAccounts 
  }
`;

export default {
  detail,
  accounts
};
