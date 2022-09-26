const paymentConfigs = `
query paymentConfigs($paymentIds: JSON!) {
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

export default {
  paymentConfigs,
  paymentConfigsCountByType,
  checkInvoice
};
