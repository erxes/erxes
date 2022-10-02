const paymentConfigs = `
query paymentConfigs($paymentIds: [String]!) {
  paymentConfigs(paymentIds: $paymentIds) {
    _id
    name
    type
    status
    config
  }
}
`;

const paymentConfigsCountByType = `
query PaymentConfigsCountByType {
  paymentConfigsCountByType {
    qpay
    socialPay
    total
  }
}
`;

const checkInvoice = `
query checkInvoice($paymentId: String!, $invoiceId: String!) {
  checkInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
}`;

const invoicesResponse = `
_id
type
amount
qrText
contentType
comment
status
invoiceNo
paymentId
createdAt
paymentDate
customer
company
`;

const invoices = `
query invoices($searchValue: String, $perPage: Int, $page: Int) {
  invoices(searchValue: $searchValue, perPage: $perPage, page: $page) {
    ${invoicesResponse}
  }
}
`;

const invoicesTotalCount = `
query invoicesTotalCount($searchValue: String) {
  invoicesTotalCount(searchValue: $searchValue)
}
`;

export default {
  paymentConfigs,
  paymentConfigsCountByType,
  checkInvoice,
  invoices,
  invoicesTotalCount
};
