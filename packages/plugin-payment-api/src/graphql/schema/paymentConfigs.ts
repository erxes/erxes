export const types = `
  type PaymentConfig {
    _id: String!
    contentType: String!
    contentTypeId: String!
    contentName: String
    paymentIds: [String]
    payments: [Payment]
  }

  type PaymentConfigList {
    list: [PaymentConfig]
    totalCount: Int
  }
`;

export const queries = `
    getPaymentConfig(contentType: String!, contentTypeId: String!): PaymentConfig
    getPaymentConfigs(contentType: String, page: Int, perPage: Int ): [PaymentConfig]
    paymentConfigsTotalCount: Int
`;

export const mutations = `
    paymentConfigsAdd(contentType: String!, contentTypeId: String!, paymentIds: [String]): PaymentConfig
    paymentConfigsEdit(_id: String!, paymentIds: [String]): PaymentConfig
    paymentConfigsRemove(_id: String!): JSON
`;
