export const types = `
type GolomtBankAccountHolder {
  number: String
  currency: String
  custFirstName: String
  custLastName: String
}

  type GolomtBankAccount {
    requestId: String
    accountId: String
    accountName: String
    shortName: String
    currency: String
    branchId: String
    isSocialPayConnected: String
    accountType: String

  }

  type GolomtBankTransaction {
    record: Int
    tranDate: String
    postDate: String
    time: String
    branch: String
    teller: String
    journal: Int
    code: Int
    amount: Float
    balance: Float
    debit: Float
    correction: Float
    description: String
    relatedAccount: String
  }

  type GolomtBankStatementTotal {
    count: Int
    credit: Float
    debit: Float
  }
  
  type GolomtBankStatement {
    account: String
    iban: String
    currency: String
    customerName: String
    productName: String
    branch: String
    branchName: String
    beginBalance: Float
    endBalance: Float
    beginDate: String
    endDate: String
    
  }

`;

const paginationParams = `
    page: Int
    perPage: Int
`;

const dateParams = `
    startDate: String
    endDate: String
`;

export const queries = `
  golomtBankAccounts(configId: String): JSON
  golomtBankAccountDetail(configId: String!, accountNumber: String!): GolomtBankAccount
  golomtBankAccountHolder(configId: String!, accountNumber: String! bankCode: String): GolomtBankAccountHolder

  golomtBankStatements(configId: String!, accountNumber: String!, ${paginationParams} ${dateParams} ): GolomtBankStatement
  golomtBankStatementsAfterRecord(configId: String!, accountNumber: String!, record: Int! ${paginationParams}): GolomtBankStatement
`;
