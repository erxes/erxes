export const types = `
  type QpayInvoice {
    _id: String!
    createdAt: Date
    senderInvoiceNo: String    
    amount: String    
    qpayInvoiceId: String
    qrText: String
    qpayPaymentId: String
    paymentDate: Date    
    status: String
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
amount: String!
`;

const addressParams = `
city: String,
district: String,
street: String,
building: String,
address: String,
zipcode: String,
longitude: String,
latitude: String
`;

const senderBranchDataParams = `
register: String,
name: String,
email: String,
phone: String,
addressId: String
`;

const senderStaffDataParams = `
name: String,
email: String,
phone: String
`;

const invoiceReceiverDataParams = `
register: String,
name: String,
email: String,
phone: String,
addressId: String
`;

const discountsParams = `
discount_code: String,
description: String!,
amount: String!,
note: String
`;

const surchargesParams = `
surcharge_code: String,
description: String!,
amount: String!,
note: String
`

const taxesParams = `
tax_code: String,
description: String!,
amount: String!,
city_tax: String,
note: String
`;

const linesParams = `
sender_product_code: String,
tax_product_code: String,
line_description: String!,
line_quantity: String!,
line_unit_price: String!,
note: String,
disctountIds: [String],
surchargeIds: [String],
taxeIds: [String]
`;

const transactionsParams = `
description: String!,
amount: String!,
accounts: String
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
  createQpaySimpleInvoice(${createSimpleInvoiceParams}): JSON
  createQpayInvoice(${createInvoiceParams}): JSON
  cancelQpayInvoice(invoiceId: String!): JSON  
  deleteQpayPayment(paymentId: String!, description: String): JSON
  
  setQpayAddress(${addressParams}): JSON
  delQpayAddress(_id: String!): JSON

  setQpaySenderBranchData(${senderBranchDataParams}): JSON
  delQpaySenderBranchData(_id: String!): JSON

  setQpaySenderStaffData(${senderStaffDataParams}): JSON
  delQpaySenderStaffData(_id: String!): JSON

  setQpayInvoiceReceiverData(${invoiceReceiverDataParams}): JSON
  delQpayInvoiceReceiverData(_id: String!): JSON

  setQpayDiscounts(${discountsParams}): JSON
  delQpayDiscounts(_id: String): JSON

  setQpaySurcharges(${surchargesParams}): JSON
  delQpaySurcharges(_id: String): JSON

  setQpayTaxes(${taxesParams}): JSON
  delQpayTaxes(_id: String): JSON

  setQpayLines(${linesParams}): JSON
  delQpayLines(_id: String): JSON

  setQpayTransaction(${transactionsParams}): JSON
  delQpayTransaction(_id: String): JSON

  createSPInvoicePhone(${socialPayInvoicePhoneParams}): JSON
  createSPInvoiceQr(${socialPayInvoiceQrParams}): JSON
  cancelSPInvoice(${socialPayInvoiceCancelParams}): JSON  
  cancelPaymentSPInvoice(${socialPayInvoiceCancelParams}): JSON  
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

  socialPayInvoices(${listPageParams}): [SocialPayInvoice]
  checkSPInvoice(${socialPayInvoiceCancelParams}): JSON

  getQpayAddresses: JSON
  getQpaySenderBranchDatas: JSON
  getQpaySenderStaffDatas: JSON
  getQpayInvoiceReceiverDatas: JSON
  getQPayDiscounts: JSON
  getQpaySurcharges: JSON
  getQpayTaxes: JSON
  getQpayLines: JSON
  getQpayTransaction: JSON
`;
