export const types = `
  type invoicesTotalCount {
    total: Int
    byKind: JSON
    byStatus: JSON
  }

  enum CustomerType {
    company
    customer
    user
  }

  type Invoice @key(fields: "_id") {
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

    transactions: [PaymentTransaction]
  }
`;

const mutationParams = `
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
  callback: String
  currency: String
`;

export const mutations = `
  generateInvoiceUrl(${mutationParams}): String
  invoiceCreate(${mutationParams}): Invoice
  invoiceUpdate(_id: String!, ${mutationParams}): Invoice
  invoicesCheck(_id:String!): String
  invoicesRemove(_ids: [String]!): String
`;

export const queries = `
  invoices(searchValue: String, kind: String, status: String, page: Int, perPage: Int, contentType: String, contentTypeId: String): [Invoice]
  invoicesTotalCount(searchValue: String, kind: String, status: String, contentType: String, contentTypeId: String): invoicesTotalCount
  invoiceDetail(_id: String!): Invoice
  invoiceDetailByContent(contentType: String!, contentTypeId: String!): [Invoice]
`;
