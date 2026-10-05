export const types = `
  type TdbAccount {
    ACNTNO: String
    IBAN: String
    iban: String
    ACNTNAME: String
    ACNTMODE: String
    CURCODE: String
    BALANCE: Float
    CUSTNO: String
    AVAILABLEBAL: Float
    HOLDBAL: Float
  }

  type TdbAccountsResponse {
    success: Boolean
    msg: String
    data: [TdbAccount]
  }

  type TdbBalanceResponse {
    success: Boolean
    msg: String
    data: TdbBalanceData
  }

  type TdbBalanceData {
    invoice: TdbAccount
  }

  type TdbStatementHeader {
    startbalance: Float
    total_credit: Float
    endbalance: Float
    total_debit: Float
    totalrecords: Int
  }

  type TdbStatementTransaction {
    txndate: String
    refno: Int
    txndesc: String
    credit: Float
    debit: Float
    balance: Float
    contacntno: String
    currate: Float
    contacntname: String
    fee: String
    bankcode: String
  }

  type TdbStatementResponse {
    success: Boolean
    msg: String
    header: [TdbStatementHeader]
    txn: [TdbStatementTransaction]
  }
`;

export const queries = `
  tdbAccounts(configId: String!): TdbAccountsResponse

  tdbAccountBalance(
    configId: String!
    accountNumberOrIban: String!
  ): TdbBalanceResponse

  tdbAccountStatement(
    configId: String!
    accountNumberOrIban: String!
    from: String!
    to: String!
    page: Int
    size: Int
  ): TdbStatementResponse
`;
