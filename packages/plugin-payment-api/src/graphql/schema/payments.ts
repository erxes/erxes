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

  type PaymentPublic {
    _id: String
    name: String
    kind: String
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
  payments(status: String, kind: String): [Payment]

  paymentsPublic(kind: String, _ids:[String], currency: String): [PaymentPublic]
  paymentsCountByType: paymentsTotalCount
  paymentsTotalCount(kind: String, status: String): paymentsTotalCount

  qpayGetMerchant(_id: String!): JSON
  qpayGetDistricts(cityCode: String!): JSON

  paymentsGetStripeKey(_id: String!): String
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
`;
