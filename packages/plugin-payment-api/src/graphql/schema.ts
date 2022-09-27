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

  type QpayInvoice {
    _id: String!
    createdAt: Date
    senderInvoiceNo: String
    amount: String
    qpayInvoiceId: String
    qrText: String
    qpayPaymentId: String
    paymentDate: Date
    customerId: String
    companyId: String
    contentType: String
    contentTypeId: String
    status: String
  }

  type SocialPayInvoice {
    _id: String!
    createdAt: Date
    invoiceNo: String
    amount: String
    phone: String
    qrText: String
    customerId: String
    companyId: String
    contentType: String
    contentTypeId: String
    status: String
  }

  type Invoice {
    _id: String
    type: String
    amount: String
    qrText: String
    customer: JSON
    company: JSON
    contentType: String
    comment: String
    status: String
    createdAt: Date
    paymentDate: Date
    paymentId: String
  }
`;

export const queries = `
  paymentConfigs(paymentIds: JSON): [PaymentConfig]
  paymentConfigsCountByType: PaymentTypeCount
  checkInvoice(paymentId: String!, invoiceId: String!): JSON
  getPaymentOptions(paymentIds: JSON,amount: Float, customerId: String, companyId: String,contentType: String, contentTypeId: String, description: String, redirectUri:String ): String

  invoices(searchValue: String, page: Int, perPage: Int): [Invoice]
`;

const params = `
  name: String!
  type: String!
  status: String
  config: JSON
`;

const invoiceParams = `
paymentId: String!
amount: Float!
description: String!
phone: String
customerId: String
companyId: String
contentType: String
contentTypeId: String
`;

export const mutations = `
  paymentConfigsAdd(${params}): PaymentConfig
  paymentConfigsEdit(id: String!,${params}): PaymentConfig
  paymentConfigRemove(id: String!): String
  createInvoice(${invoiceParams}): JSON
`;
