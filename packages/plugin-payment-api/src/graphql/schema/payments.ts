export const types = `
  type Payment {
    _id: String!
    name: String!
    kind: String!
    status: String
    config: JSON
    createdAt: Date
  }

  type paymentsTotalCount {
    byKind: JSON
    byStatus: JSON
    total: Int
  }
`;

const paymentOptionsParams = `
  paymentIds: [String]
  amount: Float
  contentType: String
  contentTypeId: String
  customerId: String
  customerType: String
  description: String
  redirectUri: String
  phone: String
`;

export const queries = `
  payments(status: String): [Payment]
  paymentsCountByType: paymentsTotalCount
  paymentsTotalCount(kind: String, status: String): paymentsTotalCount

  qpayGetMerchant(_id: String!): JSON
`;

const params = `
  name: String!
  kind: String!
  status: String
  config: JSON
`;

export const mutations = `
  paymentAdd(${params}): Payment
  paymentEdit(_id: String!,${params}): Payment
  paymentRemove(_id: String!): String

  qpayRegisterMerchantCompany(
    registerNumber: String
    name: String
    mccCode: String
    city: String
    district: String
    address: String
    phone: String
    email: String
  ): JSON

  qpayRegisterMerchantCustomer: JSON

  qpayCreateInvoice(
    merchantId: String
    amount: Int
    mccCode: String
    description: String
    callbackUrl: String
  ): JSON


`;
