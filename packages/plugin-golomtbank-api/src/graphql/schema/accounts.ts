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

  type GolomtBankAccountDetail {
    requestId: String
    accountNumber: String
    currency: String
    customerName: String
    titlePrefix: String
    accountName: String
    accountShortName: String
    freezeStatusCode: String
    freezeReasonCode: String
    openDate: String
    status: String
    productName: String
    type: JSON
    intRate: String
    isRelParty: String
    branchId: String
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

  type GolomtBankAccountBalance {
    requestId: String
    accountId: String
    accountName: String
    currency: String
    balanceLL: JSON
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
  golomtBankAccountDetail(configId: String!, accountId: String!): GolomtBankAccountDetail
  golomtBankAccountBalance(configId: String!, accountId: String!): GolomtBankAccountBalance
  golomtBankAccountHolder(configId: String!, accountId: String! bankCode: String): GolomtBankAccountHolder

  golomtBankStatements(configId: String!, accountId: String!, ${paginationParams} ${dateParams} ): GolomtBankStatement
  golomtBankStatementsAfterRecord(configId: String!, accountId: String!, record: Int! ${paginationParams}): GolomtBankStatement
`;
