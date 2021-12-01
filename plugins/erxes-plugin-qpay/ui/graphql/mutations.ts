
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

// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default {
  updateConfigs,
  createInvoice
};
