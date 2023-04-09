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
`;

export const mutations = `
  generateInvoiceUrl(${mutationParams}): String
`;

export const queries = `
  checkInvoice(_id:String!): String
  invoices(searchValue: String, kind: String, status: String, page: Int, perPage: Int, contentType: String, contentTypeId: String): [Invoice]
  invoicesTotalCount(searchValue: String, kind: String, status: String, contentType: String, contentTypeId: String): invoicesTotalCount
`;
