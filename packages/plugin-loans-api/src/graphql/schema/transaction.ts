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
  balance: Float,
  closeAmount: Float,
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

  type LoanTransaction {
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

    contract: LoanContract,
    invoice: InvoicePreInfo,
    customer: Customer,
    company: Company,
    calcedInfo: CalcedInfo
    currency:String
    ebarimt:JSON
  }

  type TransactionsListResponse {
    list: [LoanTransaction],
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
  transactions(${queryParams}): [LoanTransaction]
  transactionDetail(_id: String!): LoanTransaction
  getPaymentInfo(id: String!, payDate: Date, scheduleDate:Date): TransactionPreInfo
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
  interestEve: Float,
  interestNonce: Float,
  undue: Float,
  insurance: Float,
  debt: Float,
  currency:String,
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
  transactionsAdd(${commonFields}): LoanTransaction
  transactionsEdit(_id: String!, ${commonFields}): LoanTransaction
  transactionsChange(_id: String!, ${changeFields}): LoanTransaction
  transactionsRemove(transactionIds: [String]): [String]
  createEBarimtOnTransaction(id: String!,isGetEBarimt: Boolean,isOrganization: Boolean,organizationRegister: String):LoanTransaction
`;
