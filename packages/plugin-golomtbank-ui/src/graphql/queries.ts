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
      }
      totalCount
    }
  }
`;
const ratesQuery = `
query KhanbankRates {
  khanbankRates {
    sellRate
    number
    name
    midRate
    currency
    cashSellRate
    cashBuyRate
    buyRate
  }
}
`;
export default {
  listQuery,
  ratesQuery
};
