const typeFields = `
  number: String,
  contractId: String,
  payDate: Date,
  payment: Float,
  total: Float,
  balance: Float,
  storedInterest: Float,
  closeAmount: Float,
  transactionType: String
`;
export const types = `
  type SavingTransactionPreInfo {
    ${typeFields}
  }

  type SavingTransaction {
    _id: String,
    createdAt: Date,
    createdBy: String
    customerId: String,
    companyId: String,
    invoiceId: String,
    description: String,
    status: String,
    ${typeFields}
    contract: SavingContract,
    currency:String
    ebarimt:JSON
  }

  type SavingTransactionsListResponse {
    list: [SavingTransaction],
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
  savingsTransactionsMain(${queryParams}): SavingTransactionsListResponse
  savingsTransactions(${queryParams}): [SavingTransaction]
  savingsTransactionDetail(_id: String!): SavingTransaction
`;

const commonFields = `
  contractId: String,
  customerId: String,
  companyId: String,
  invoiceId: String,
  payDate: Date,
  description: String,
  total: Float,
  isManual: Boolean,
  payment: Float,
  currency:String,
  isOrganization: Boolean,
  organizationRegister: String,
  transactionType: String
`;

const changeFields = `
  payment: Float,
`;

export const mutations = `
  savingsTransactionsAdd(${commonFields}): SavingTransaction
  savingsTransactionsEdit(_id: String!, ${commonFields}): SavingTransaction
  savingsTransactionsChange(_id: String!, ${changeFields}): SavingTransaction
  savingsTransactionsRemove(transactionIds: [String]): [String]
`;
