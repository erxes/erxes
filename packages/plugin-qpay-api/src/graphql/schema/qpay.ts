import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
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
`;

const createInvoiceParams = `
  sender_invoice_no_auto: Boolean!
  sender_branch_code: String
  sender_branch_dataId: String
  sender_staff_code: String
  sender_staff_dataId: String
  sender_terminal_code: String
  sender_terminal_data: String
  invoice_receiver_code: String!
  invoice_receiver_dataId: String
  invoice_description: String!
  invoice_due_date: String
  enable_expiry: Boolean
  expiry_date: String
  calculate_vat: Boolean
  tax_customer_code: String
  line_tax_code: String
  allow_partial: Boolean
  minimum_amount: String
  allow_exceed: Boolean
  maximum_amount: String
  amount: String
  callback_url: String
  note: String
  lines: [String]
  transactions: [String]
`;

const createSimpleInvoiceParams = `
  sender_invoice_no_auto: Boolean!,
  sender_invoice_no: String,
  invoice_receiver_code: String!,
  invoice_description: String!,
  amount: String!,
  customerId: String,
  companyId: String,
  contentType: String,
  contentTypeId: String
`;

export const mutations = `
  createQpaySimpleInvoice(${createSimpleInvoiceParams}): JSON
  createQpayInvoice(${createInvoiceParams}): JSON
  cancelQpayInvoice(invoiceId: String!): JSON
  deleteQpayPayment(paymentId: String!, description: String): JSON
`;

const listPaymentParams = `
  objectType: String!,
  objectId: String!,
  merchant_branch_code: String,
  merchant_terminal_code: String,
  merchant_staff_code: String,
  page: Int,
  limit: Int
`;

const listPageParams = `
  page: Int,
  perPage: Int
`;

export const queries = `
  qpayInvoices(${listPageParams}): [QpayInvoice]
  getQpayInvoiceDetails(invoiceId: String!): JSON
  checkQpayPayments(objectType: String!, objectId: String!, page: Int, limit: Int): JSON
  listQpayPayments(${listPaymentParams}): JSON
  getQpayNuat(paymentId: String!, receiverType: String!): JSON
`;
