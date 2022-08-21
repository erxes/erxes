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

  type SocialPayInvoice {
    _id: String!
    createdAt: Date
    invoiceNo: String
    amount: String
    phone: String
    qrText: String
    status: String
  }
`;

const socialPayInvoicePhoneParams = `
  amount: String!,
  invoiceNoAuto: Boolean!,
  invoice: String,
  phone: String!
`;

const socialPayInvoiceQrParams = `
  amount: String!
  invoiceNoAuto: Boolean!,
  invoice: String,
`;

const socialPayInvoiceCancelParams = `
  invoiceNo: String!
`;

export const mutations = `
  createSPInvoicePhone(${socialPayInvoicePhoneParams}): JSON
  createSPInvoiceQr(${socialPayInvoiceQrParams}): JSON
  cancelSPInvoice(${socialPayInvoiceCancelParams}): JSON
  cancelPaymentSPInvoice(${socialPayInvoiceCancelParams}): JSON
`;

const listPageParams = `
  page: Int,
  perPage: Int
`;

export const queries = `
  socialPayInvoices(${listPageParams}): [SocialPayInvoice]
  checkSPInvoice(${socialPayInvoiceCancelParams}): JSON
`;
