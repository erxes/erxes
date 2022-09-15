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
  checkInvoice(paymentId: String!, invoiceId: String!): JSON
  getPaymentOptions(paymentIds: JSON,amount: Float, customerId: String, companyId: String,contentType: String, contentTypeId: String): String
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
