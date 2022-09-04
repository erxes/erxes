export const types = `
  type PaymentConfig {
    _id: String!
    name: String!
    type: String!
    status: String
    config: JSON
    craetedAt: Date
  }

  type PaymentTypeCount {
    qpay: Int
    socialPay: Int
    total: Int
  }
`;

export const queries = `
  paymentConfigs: [PaymentConfig]
  paymentConfigsCountByType: PaymentTypeCount
`;

const params = `
  name: String!
  type: String!
  status: String
  config: JSON
`;

export const mutations = `
  paymentConfigsAdd(${params}): PaymentConfig
  paymentConfigsEdit(id: String!,${params}): PaymentConfig
  paymentConfigRemove(id: String!): String
  createInvoice(paymentId: String!, amount: Float!, description: String!,phone: String, customerId: String, companyId: String): JSON
`;
