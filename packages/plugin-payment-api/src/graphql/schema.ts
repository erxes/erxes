export const types = `
  type PaymentConfig {
    _id: String!
    name: String!
    type: String!
    status: String
    config: JSON
    craetedAt: Date
  }
`;

export const queries = `
  paymentConfigs: [PaymentConfig]
  paymentConfigsCountByType(type: String): Int
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
