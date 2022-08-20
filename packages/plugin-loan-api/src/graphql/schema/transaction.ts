const typeFields = `
  number: String,
  contractId: String,
  payDate: Date,
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  undue: Float,
  insurance: Float,
  debt: Float,
  total: Float,
`;
export const types = `
  type TransactionPreInfo {
    ${typeFields}
  }

  type CalcedInfo {
    payment: Float,
    interestEve: Float,
    interestNonce: Float,
    undue: Float,
    insurance: Float,
    debt: Float,
    total: Float,
  }

  type Transaction {
    _id: String,
    createdAt: Date,
    createdBy: String
    customerId: String,
    companyId: String,
    invoiceId: String,
    description: String,
    status: String,
    ${typeFields}
    futureDebt: Float,
    debtTenor: Float,

    contract: Contract,
    invoice: InvoicePreInfo,
    customer: Customer,
    company: Company,
    calcedInfo: CalcedInfo
  }

  type TransactionsListResponse {
    list: [Transaction],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  contractId: String
  customerId: String
  companyId: String
  startDate: String
  endDate: String
  ids: [String]
  searchValue: String
  payDate: String
  contractHasnt: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  transactionsMain(${queryParams}): TransactionsListResponse
  transactions(${queryParams}): [Transaction]
  transactionDetail(_id: String!): Transaction
  getTransactionPreInfo(contractId: String!, payDate: String): TransactionPreInfo
`;

const commonFields = `
  contractId: String,
  customerId: String,
  companyId: String,
  invoiceId: String,
  payDate: Date,
  description: String,
  total: Float,

  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  undue: Float,
  insurance: Float,
  debt: Float,
`;

const changeFields = `
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  undue: Float,
  insurance: Float,
  debt: Float,
  futureDebt: Float
  debtTenor: Float
`;

export const mutations = `
  transactionsAdd(${commonFields}): Transaction
  transactionsEdit(_id: String!, ${commonFields}): Transaction
  transactionsChange(_id: String!, ${changeFields}): Transaction
  transactionsRemove(transactionIds: [String]): [String]
`;
