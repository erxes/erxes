export const types = `
  enum PaymentMethodStatus {
    active
    inactive
  }

  type PaymentMethod {
    _id: String!
    name: String!
    kind: String!
    status: PaymentMethodStatus
    config: JSON
    createdAt: Date
  }

  type PaymentMethodsTotalCount {
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

export const inputs = `
  input PaymentInput {
    name: String!
    kind: String!
    status: PaymentMethodStatus
    config: JSON
  }
`;

export const queries = `
  payments(status: String, kind: String): [PaymentMethod]

  paymentsPublic(kind: String, _ids:[String], currency: String): [PaymentPublic]
  paymentsCountByType: PaymentMethodsTotalCount
  paymentsTotalCount(kind: String, status: String): PaymentMethodsTotalCount

  qpayGetMerchant(_id: String!): JSON
  qpayGetDistricts(cityCode: String!): JSON

  paymentsGetStripeKey(_id: String!): String

  cpPayments(status: String, kind: String): [PaymentMethod]
`;

export const mutations = `
  paymentAdd(input: PaymentInput!): PaymentMethod
  paymentEdit(_id: String!, input: PaymentInput!): PaymentMethod
  paymentRemove(_id: String!): String
`;
