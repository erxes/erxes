export const types = `
  type QPayUrl {
    name: String
    description: String
    logo: String
    link: String
  }

  type QPayInvoice {
    _id: String
    senderInvoiceNo: String
    amount: String
    qpayInvoiceId: String
    qrText: String
    qpayPaymentId: String
    paymentDate: Date
    status: String
    createdAt: Date
    urls: [QPayUrl]
  }
`;

export const mutations = `
  poscCreateQpaySimpleInvoice(orderId: String!, amount: Float): QPayInvoice
  qpayCheckPayment(orderId: String!, _id: String): QPayInvoice
  qpayCancelInvoice(_id: String!): JSON
`;

export const queries = `
  fetchRemoteInvoice(orderId: String!): JSON
  poscQpayInvoices(page: Int, perPage: Int, number: String): [QPayInvoice]
`;
