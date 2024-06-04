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
query GolomtBankAccountDetail($accountNumber: String!, $configId: String!) {
  golomtBankAccountDetail(accountNumber: $accountNumber, configId: $configId) {
    ${commonFields}
    homeBranch
    homePhone
    intFrom
    intMethod
    intRate
    intTo
    lastFinancialTranDate
    
    holderInfo(accountNumber: $accountNumber, configId: $configId) {
      custLastName
      custFirstName
    }
  }
}
`;

export default {
  listQuery,
  detailQuery
};
