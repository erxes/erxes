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

  type Invoice {
    _id: String,
    createdAt: Date,
    createdBy: String
    customerId: String,
    companyId: String,
    status: String,
    ${typeFields}

    contract: Contract,
    customer: Customer,
    company: Company,
    transaction: Transaction,
  }

  type InvoicesListResponse {
    list: [Invoice],
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
  invoicesMain(${queryParams}): InvoicesListResponse
  invoices(${queryParams}): [Invoice]
  invoiceDetail(_id: String!): Invoice
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
  invoicesAdd(${commonFields}): Invoice
  invoicesEdit(_id: String!, ${commonFields}): Invoice
  invoicesRemove(invoiceIds: [String]): [String]
`;
