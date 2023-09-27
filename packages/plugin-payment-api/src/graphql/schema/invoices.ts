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
    paymentId: String
    amount: Float
    phone: String
    email: String
    description: String
    status: String
    customerType: CustomerType
    customerId: String
    contentType: String
    contentTypeId: String
    createdAt: Date
    resolvedAt: Date
    payment: Payment
    paymentKind: String
    apiResponse: JSON

    customer: JSON
    idOfProvider: String
    errorDescription: String
    pluginData: JSON
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
  warningText: String
  data: JSON
`;

export const mutations = `
  generateInvoiceUrl(${mutationParams}): String
  invoicesCheck(_id:String!): String
  invoicesRemove(_ids: [String]!): String
`;

export const queries = `
  invoices(searchValue: String, kind: String, status: String, page: Int, perPage: Int, contentType: String, contentTypeId: String): [Invoice]
  invoicesTotalCount(searchValue: String, kind: String, status: String, contentType: String, contentTypeId: String): invoicesTotalCount
  invoiceDetail(_id: String!): Invoice
  invoiceDetailByContent(contentType: String!, contentTypeId: String!): [Invoice]
`;
