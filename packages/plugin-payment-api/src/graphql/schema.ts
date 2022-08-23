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
`;
