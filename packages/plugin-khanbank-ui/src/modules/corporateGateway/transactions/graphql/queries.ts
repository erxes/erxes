const transactionsQuery = `
query KhanbankStatements($accountNumber: String!, $configId: String!, $endDate: String, $page: Int, $perPage: Int, $startDate: String) {
    khanbankStatements(accountNumber: $accountNumber, configId: $configId, endDate: $endDate, page: $page, perPage: $perPage, startDate: $startDate) {
      account
      beginBalance
      beginDate
      branch
      branchName
      currency
      customerName
      endBalance
      endDate
      iban
      productName
      total {
        count
        credit
        debit
      }
      transactions {
        amount
        balance
        branch
        code
        correction
        debit
        description
        journal
        postDate
        record
        relatedAccount
        teller
        time
        tranDate
      }
    }
  }
`;

const accountsQuery = `
query KhanbankAccounts($configId: String!) {
  khanbankAccounts(configId: $configId) {
    number
    type
    currency
    balance
    name
  }
}
`;

const accountHolderQuery = `
query KhanbankAccountHolder($accountNumber: String!, $configId: String!, $bankCode: String) {
  khanbankAccountHolder(accountNumber: $accountNumber, configId: $configId, bankCode: $bankCode) {
    number
    custLastName
    custFirstName
    currency
  }
}
`;

export default {
  transactionsQuery,
  accountsQuery,
  accountHolderQuery
};
