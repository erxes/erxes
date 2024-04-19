
export const types = `

  type nonBalanceDetail {
    ktAmount: Float,
    dtAmount:  Float,
    type: String,
    currency: String
  }

  type nonBalanceTransaction {
    _id: String,
    createdAt: Date,
    createdBy: String
    contractId: String,
    customerId: String,
    description: String,
    number: String,
    contract: LoanContract,
    customer: Customer,
    transactionType: String,
    detail:[nonBalanceDetail]
  }

  type nonBalanceTransactionsListResponse {
    list: [nonBalanceTransaction],
    totalCount: Float,
  }
`;
const detail = `
  ktAmount: Float,
  dtAmount:  Float,
  type: String,
  currency: String
`;
const commonFields = `
  contractId: String,
  customerId: String,
  description: String,
  number: String,
  transactionType: String,
  detail: [JSON]
`;

const queryParams = `
  page: Int
  perPage: Int
  contractId: String
  customerId: String
  startDate: String
  endDate: String
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;
export const queries = `
  nonBalanceTransactions(${queryParams}): [nonBalanceTransaction]
  nonBalanceTransactionsMain(${queryParams}): nonBalanceTransactionsListResponse
  nonBalanceTransactionDetail(_id: String!): nonBalanceTransaction
`;

export const mutations = `
  nonBalanceTransactionsAdd(${commonFields}): nonBalanceTransaction
  nonBalanceTransactionsRemove(nonBalanceTransactionIds: [String]): [String]
`
