const transactionsQuery = `
query GolomtBankStatements($configId: String!, $accountId: String!, $startDate: String, $endDate: String, $page: Int, $perPage: Int) {
  golomtBankStatements(configId: $configId, accountId: $accountId, startDate: $startDate, endDate: $endDate, page: $page, perPage: $perPage) {
    requestId
    accountId
    statements {
      requestId
      recNum
      tranId
      tranDate
      drOrCr
      tranAmount
      tranDesc
      tranPostedDate
      tranCrnCode
      exchRate
      balance
      accName
      accNum
    }
  }
}
`;
const accountsQuery = `
query Query($configId: String) {
  golomtBankAccounts(configId: $configId)
}
`;

const accountHolderQuery = `
query GolomtBankAccountHolder($accountNumber: String!, $configId: String!, $bankCode: String) {
  golomtBankAccountHolder(accountNumber: $accountNumber, configId: $configId, bankCode: $bankCode) {
    number
    custLastName
    custFirstName
    currency
  }
}
`;
const listQuery = `
query GolomtBankAccounts($configId: String) {
  golomtBankAccounts(configId: $configId)
}
`;
export default {
  transactionsQuery,
  accountsQuery,
  accountHolderQuery,
  listQuery
};
