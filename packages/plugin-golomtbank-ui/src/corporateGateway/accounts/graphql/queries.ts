const detailQuery = `
query GolomtBankAccountDetail($configId: String!, $accountId: String!) {
  golomtBankAccountDetail(configId: $configId, accountId: $accountId) {
    requestId
    accountNumber
    currency
    customerName
    titlePrefix
    accountName
    accountShortName
    freezeStatusCode
    freezeReasonCode
    openDate
    status
    productName
    type
    intRate
    isRelParty
    branchId
  }
}
`;
const getBalance = `query GolomtBankAccountBalance($configId: String!, $accountId: String!) {
  golomtBankAccountBalance(configId: $configId, accountId: $accountId) {
    currency
    balanceLL
  }
}`;
export default {
  detailQuery,
  getBalance
};
