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
    searchValue: String
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
    searchValue: String
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

const paymentOptionsParams = `
  paymentIds: [String]
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
  paymentConfigs(paymentIds: [String]): [PaymentConfig]
  paymentConfigsCountByType: PaymentTypeCount
  checkInvoice(paymentId: String!, invoiceId: String!): JSON
  getInvoice(paymentId: String!, invoiceId: String!): JSON
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
paymentId: String!
amount: Float!
description: String!
phone: String
customerId: String
companyId: String
contentType: String
contentTypeId: String
searchValue: String
`;

export const mutations = `
  paymentConfigsAdd(${params}): PaymentConfig
  paymentConfigsEdit(id: String!,${params}): PaymentConfig
  paymentConfigRemove(id: String!): String
  createInvoice(${invoiceParams}): JSON
`;
