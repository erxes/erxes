const paymentConfigs = `
query paymentConfigs($paymentConfigIds: [String]!) {
  paymentConfigs(paymentConfigIds: $paymentConfigIds) {
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
query checkInvoice($paymentConfigId: String!, $invoiceId: String!) {
  checkInvoice(paymentConfigId: $paymentConfigId, invoiceId: $invoiceId)
}`;

const invoicesResponse = `
_id
type
amount
qrText
contentType
comment
status
createdAt
paymentDate
paymentConfigId
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
