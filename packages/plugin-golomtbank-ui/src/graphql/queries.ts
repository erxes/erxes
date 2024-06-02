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

const listQuery = `
query GolomtBankConfigsList($page: Int, $perPage: Int) {
  GolomtBankConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        userName
        clientId
      }
      totalCount
    }
  }
`;
export default {
  detail,
  accounts,
  configs,
  listQuery
};
