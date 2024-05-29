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
    golomtBankAccounts
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
