const qpayInvoices = `
  query qpayInvoices($page: Int, $perPage: Int, $number: String) {
    qpayInvoices(page: $page, perPage: $perPage, number: $number) {
      _id
      senderInvoiceNo
      createdAt
      status
      amount
      qpayInvoiceId
      qpayPaymentId
      qrText
    }
  }
`;

export default {
  qpayInvoices
};
