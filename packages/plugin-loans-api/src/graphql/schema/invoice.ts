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
  type InvoicePreInfo {
    ${typeFields}
  }

  type LoanInvoice {
    _id: String,
    createdAt: Date,
    createdBy: String
    customerId: String,
    companyId: String,
    status: String,
    ${typeFields}

    contract: LoanContract,
    customer: Customer,
    company: Company,
    transaction: LoanTransaction,
  }

  type LoanInvoicesListResponse {
    list: [LoanInvoice],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  contractId: String
  customerId: String
  companyId: String
  payDate1: String
  payDate2: String
  ids: [String]
  number: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  loanInvoicesMain(${queryParams}): LoanInvoicesListResponse
  loanInvoices(${queryParams}): [LoanInvoice]
  loanInvoiceDetail(_id: String!): LoanInvoice
  getInvoicePreInfo(contractId: String!, payDate: String): InvoicePreInfo
`;

const commonFields = `
  number: String,
  contractId: String,
  customerId: String,
  companyId: String,
  payDate: Date,
  payment: Float,
  interestEve: Float,
  interestNonce: Float,
  undue: Float,
  insurance: Float,
  debt: Float,
  total: Float,
`;

export const mutations = `
  loanInvoicesAdd(${commonFields}): LoanInvoice
  loanInvoicesEdit(_id: String!, ${commonFields}): LoanInvoice
  loanInvoicesRemove(invoiceIds: [String]): [String]
`;
