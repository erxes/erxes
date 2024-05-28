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
const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;


export default {
  detail,
  accounts,
  configs
};
