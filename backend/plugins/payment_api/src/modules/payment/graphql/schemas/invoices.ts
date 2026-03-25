export const types = `
  type invoicesTotalCount {
    total: Int
    byKind: JSON
    byStatus: JSON
  }

  type PaymentInvoice @key(fields: "_id") {
    _id: String
    invoiceNumber: String

    amount: Float
    currency: String
    remainingAmount: Float
    
    phone: String
    email: String
    description: String
    status: String
    customerType: String
    customerId: String
    customer: JSON

    contentType: String
    contentTypeId: String

    createdAt: Date
    resolvedAt: Date
    redirectUri: String
    paymentIds: [String]
    
    data: JSON
    warningText: String

    transactions: [PaymentTransaction]
  }

  type PaymentInvoicesListResponse {
    list: [PaymentInvoice],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

export const inputs = `
  input InvoiceInput {
    amount: Float!
    phone: String
    email: String
    description: String
    customerId: String
    customerType: String
    contentType: String
    contentTypeId: String
    redirectUri: String
    paymentIds: [String]
    data: JSON
    warningText: String
    callback: String
    currency: String
  }
`;

export const mutations = `
  generateInvoiceUrl(input: InvoiceInput!): String
  invoiceCreate(input: InvoiceInput!): PaymentInvoice
  invoiceUpdate(_id: String!, input: InvoiceInput!): PaymentInvoice
  invoicesCheck(_id:String!): String
  invoicesRemove(_ids: [String]!): String

  cpInvoiceCreate(input: InvoiceInput!): PaymentInvoice
  cpInvoicesCheck(_id:String!): String
`;

const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
`;

const queryParams = `
  searchValue: String
  kind: String
  status: String
  
  contentType: String
  contentTypeId: String
  ${cursorParams}
`;

export const queries = `
  invoices(${queryParams}): PaymentInvoicesListResponse
  invoicesTotalCount(${queryParams}): invoicesTotalCount
  invoiceDetail(_id: String!): PaymentInvoice
  invoiceDetailByContent(contentType: String!, contentTypeId: String!): [PaymentInvoice]
`;