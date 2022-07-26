const commonFields = `
  _id: String!
  createdAt: Date
`;

const orderFields = `
  status: String
  customerId: String
  number: String
`;

const paymentInputDefs = `
  cashAmount: Float
  billType: String
  registerNumber: String
  mobileAmount: Float
  cardAmount: Float
`;

const addEditParams = `
  items: [OrderItemInput],
  totalAmount: Float!,
  type: String!,
  branchId: String,
  customerId: String,
  deliveryInfo: JSON,
  billType: String,
  registerNumber: String
  slotId: String
`;

export const types = `
  type PosOrderItem {
    ${commonFields}
    productId: String!
    count: Int!
    orderId: String!
    unitPrice: Float
    discountAmount: Float
    discountPercent: Float
    productName: String
    isPackage: Boolean
    isTake: Boolean
    productImgUrl: String
    slotId: String
  }

  type PosPutResponse {
    createdAt: Date
    date: String
    contentType: String
    contentId: String
    amount: String
    billType: String
    cashAmount: String
    nonCashAmount: String
    customerNo: String
    cityTax: String
    vat: String
    taxType: String
    registerNo: String
    billId: String
    macAddress: String
    lottery: String
    qrData: String
    success: String
    customerName: String
    modifiedAt: Date
    sendInfo: JSON
    internalCode: String
    lotteryWarningMsg: String
    errorCode: String
    message: String
    getInformation: String
    returnBillId: String
  }

  type CardPayment {
    _id: String
    amount: Float
    cardInfo: JSON
  }


  type Order {
    ${commonFields}
    ${orderFields}
    ${paymentInputDefs}

    paidDate: Date
    modifiedAt: Date
    totalAmount: Float
    finalAmount: Float
    shouldPrintEbarimt: Boolean
    printedEbarimt: Boolean
    billId: String
    oldBillId: String
    type: String
    branchId: String
    deliveryInfo: JSON
    cardPaymentInfo: String
    cardPayments: [CardPayment]
    origin: String
    customer: PosCustomer
    items: [PosOrderItem]
    user: PosUser
    putResponses: [PosPutResponse]
    qpayInvoice: QPayInvoice
    qpayInvoices: [QPayInvoice]

    slotId: String
  }

  input OrderItemInput {
    _id: String
    productId: String!
    count: Int!
    unitPrice: Float!
    isPackage: Boolean
    isTake: Boolean
  }

  input OrderPaymentInput {
    ${paymentInputDefs}
  }
`;

export const mutations = `
  ordersAdd(${addEditParams}, origin: String): Order
  ordersEdit(_id: String!, ${addEditParams}): Order
  ordersMakePayment(_id: String!, doc: OrderPaymentInput): PosPutResponse
  orderChangeStatus(_id: String!, status: String): Order
  ordersAddPayment(_id: String!, cashAmount: Float, cardAmount: Float, cardInfo: JSON): Order
  ordersCancel(_id: String!): JSON
  ordersSettlePayment(_id: String!, billType: String!, registerNumber: String): PosPutResponse
`;

export const queries = `
  orders(searchValue: String, page: Int, perPage: Int): [Order]
  fullOrders(searchValue: String, statuses: [String], customerId: String, page: Int, perPage: Int, sortField: String, sortDirection: Int): [Order]
  orderDetail(_id: String): Order
  ordersCheckCompany(registerNumber: String!): JSON
  ordersDeliveryInfo(orderId: String!): JSON
`;
