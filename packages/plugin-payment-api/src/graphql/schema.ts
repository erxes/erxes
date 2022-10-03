export const types = `
  type PaymentConfig {
    _id: String!
    name: String!
    type: String!
    status: String
    config: JSON
    createdAt: Date
  }

  type PaymentTypeCount {
    qpay: Int
    socialPay: Int
    total: Int
  }

  type Invoice {
    _id: String
    paymentConfigId: String
    amount: Float
    phone: String
    email: String
    description: String
    status: String
    companyId: String
    customerId: String
    contentType: String
    contentTypeId: String
    createdAt: Date
    resolvedAt: Date
    paymentConfig: PaymentConfig

    apiResponse: JSON
  }
`;

const paymentOptionsParams = `
  paymentConfigIds: [String]
  amount: Float
  contentType: String
  contentTypeId: String
  customerId: String
  companyId: String
  description: String
  redirectUri: String
  phone: String
`;

export const queries = `
  paymentConfigs(paymentConfigIds: [String]): [PaymentConfig]
  paymentConfigsCountByType: PaymentTypeCount
  checkInvoice(_id:String!, paymentConfigId: String!): Invoice
  getPaymentOptions(${paymentOptionsParams} ): String

  invoices(searchValue: String, page: Int, perPage: Int): [Invoice]
  invoicesTotalCount(searchValue: String): Int
`;

const params = `
  name: String!
  type: String!
  status: String
  config: JSON
`;

const invoiceParams = `
  paymentConfigId: String!
  amount: Float
  phone: String 
  email: String
  description: String
  companyId: String
  customerId: String
  contentType: String
  contentTypeId: String
`;

export const mutations = `
  paymentConfigsAdd(${params}): PaymentConfig
  paymentConfigsEdit(id: String!,${params}): PaymentConfig
  paymentConfigRemove(id: String!): String
  invoiceCreate(${invoiceParams}): Invoice
  invoiceCancel(_id: String!): String
`;
