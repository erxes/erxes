export const types = `
type KhanbankAccountHolder {
  number: String
  currency: String
  custFirstName: String
  custLastName: String
}

  type KhanbankAccount {
    number: String
    type: String
    currency: String
    status: String
    balance: Float
    name: String
    holdBalance: Float
    availableBalance: Float
    openDate: String
    homeBranch: String
    intMethod: String
    intRate: String
    homePhone: String
    businessPhone: String

    lastMaintenceDate: String
    lastFinancialTranDate: String

    intFrom: String
    intTo: String
    addr1: String

    holderInfo(configId: String!, accountNumber: String!): KhanbankAccountHolder
  }

  type KhanbankTransaction {
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

  type KhanbankStatementTotal {
    count: Int
    credit: Float
    debit: Float
  }
  
  type KhanbankStatement {
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
    total: KhanbankStatementTotal
  
    transactions: [KhanbankTransaction]
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
  khanbankAccounts(configId: String!): [KhanbankAccount]
  khanbankAccountDetail(configId: String!, accountNumber: String!): KhanbankAccount
  khanbankAccountHolder(configId: String!, accountNumber: String! bankCode: String): KhanbankAccountHolder

  khanbankStatements(configId: String!, accountNumber: String!, ${paginationParams} ${dateParams} ): KhanbankStatement
  khanbankStatementsAfterRecord(configId: String!, accountNumber: String!, record: Int! ${paginationParams}): KhanbankStatement
`;
