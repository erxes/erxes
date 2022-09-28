const checkInvoiceQuery = `query checkInvoice($paymentId: String!, $invoiceId: String!) {
  checkInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
}`;

const getInvoiceQuery = `query getInvoice($paymentId: String!, $invoiceId: String!) {
  getInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
}`;

const paymentConfigs = `
query paymentConfigs($paymentIds: [String]) {
  paymentConfigs(paymentIds: $paymentIds) {
    _id
    name
    type
    status
    config
  }
}
`;

const queries = { checkInvoiceQuery, paymentConfigs, getInvoiceQuery };

export default queries;
