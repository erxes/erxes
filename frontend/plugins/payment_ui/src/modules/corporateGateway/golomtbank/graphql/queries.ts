const listQuery = `
query GolomtBankConfigsList($page: Int, $perPage: Int) {
    golomtBankConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        name
        organizationName
        clientId
        ivKey
        sessionKey
        registerId
        configPassword
        accountId
        golomtCode
        apiUrl
      }
      totalCount
    }
  }
`;

export default {
  listQuery,
};
