const commonFields = `
requestId
accountId
accountName
shortName
currency
branchId
isSocialPayConnected
accountType
`;

const listQuery = `
query GolomtBankAccounts($configId: String) {
    golomtBankAccounts(configId: $configId) {
        ${commonFields}
    }
  }
`;

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
}`
export default {
  listQuery,
  detailQuery,
  getBalance
};
