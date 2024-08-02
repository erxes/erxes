const typeFields = `
  number: String,
  contractId: String,
  payDate: Date,
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  loss: Float,
  insurance: Float,
  debt: Float,
  total: Float,
  balance: Float,
  storedInterest: Float,
  commitmentInterest: Float,
  calcInterest: Float,
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
    loss: Float,
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
    currency: String
    ebarimt: JSON
    transactionType: String
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
  description: String
  transactionType: String
  total: Float
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
  transactionType: String,
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  loss: Float,
  insurance: Float,
  debt: Float,
  currency:String,
  isGetEBarimt: Boolean,
  isOrganization: Boolean,
  organizationRegister: String,
  storedInterest: Float,
  calcInterest: Float,
  commitmentInterest: Float
`;

const changeFields = `
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  loss: Float,
  insurance: Float,
  debt: Float,
  futureDebt: Float
  debtTenor: Float
`;

const clientFields = `
  secondaryPassword: String
`;

export const mutations = `
  transactionsAdd(${commonFields}): LoanTransaction
  clientTransactionsAdd(${commonFields}${clientFields}): LoanTransaction
  transactionsEdit(_id: String!, ${commonFields}): LoanTransaction
  transactionsChange(_id: String!, ${changeFields}): LoanTransaction
  transactionsRemove(transactionIds: [String]): [String]
  createEBarimtOnTransaction(id: String!,isGetEBarimt: Boolean,isOrganization: Boolean,organizationRegister: String):LoanTransaction
`;
