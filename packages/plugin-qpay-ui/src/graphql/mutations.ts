const createQpayFields = `
$sender_invoice_no_auto: Boolean!,
$sender_invoice_no: String,
$invoice_receiver_code: String!,
$invoice_description: String!,
$amount: String!
`;

const createQpayVariables = `
sender_invoice_no_auto: $sender_invoice_no_auto,
sender_invoice_no: $sender_invoice_no,
invoice_receiver_code: $invoice_receiver_code,
invoice_description: $invoice_description,
amount: $amount
`;

const createInvoice = `
  mutation createQpaySimpleInvoice(${createQpayFields}) {
    createQpaySimpleInvoice(${createQpayVariables})
  }
`;

const spInvoicePhoneFields = `
$amount: String!
$invoiceNoAuto: Boolean!
$invoice: String
$phone: String!
`;

const spInvoicePhoneVariables = `
amount: $amount
invoiceNoAuto: $invoiceNoAuto
invoice: $invoice
phone: $phone
`;

const createSPInvoicePhone = `
mutation createSPInvoicePhone(${spInvoicePhoneFields}) {
  createSPInvoicePhone(${spInvoicePhoneVariables})   
}
`;

const spInvoiceQrFields = `
$amount: String!
$invoiceNoAuto: Boolean!
$invoice: String
`;

const spInvoiceQrVariables = `
amount: $amount
invoiceNoAuto: $invoiceNoAuto
invoice: $invoice
`;

const createSPInvoiceQr = `
mutation createSPInvoiceQr(${spInvoiceQrFields}) {
  createSPInvoiceQr(${spInvoiceQrVariables})
}
`;

// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default {
  updateConfigs,
  createInvoice,
  createSPInvoicePhone,
  createSPInvoiceQr
};
