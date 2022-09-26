const checkInvoiceQuery = `query checkInvoice($paymentId: String!, $invoiceId: String!) {
  checkInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
}`;

const paymentConfigs = `
query paymentConfigs($paymentIds: JSON) {
  paymentConfigs(paymentIds: $paymentIds) {
    _id
    name
    type
    status
    config
  }
}
`;

const queries = { checkInvoiceQuery, paymentConfigs };

export default queries;
