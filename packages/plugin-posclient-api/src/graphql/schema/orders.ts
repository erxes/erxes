const commonFields = `
  _id: String!
  createdAt: Date
`;

const orderFields = `
  status: String
  customerId: String
  number: String
`;

const PaidAmountDefs = `
  _id: String
  type: String
  amount: Float
  info: JSON
`;

const paymentInputDefs = `
  cashAmount: Float
  mobileAmount: Float
  billType: String
  registerNumber: String
`;

const addEditParams = `
  items: [OrderItemInput],
  totalAmount: Float!,
  type: String!,
  branchId: String,
  customerId: String,
  customerType: String,
  deliveryInfo: JSON,
  billType: String,
  registerNumber: String,
  slotCode: String,
  origin: String
`;

export const types = `
  type PaidAmount {
    ${PaidAmountDefs}
  }

  type PosOrderItem {
    ${commonFields}
    productId: String!
    count: Float!
    orderId: String!
    unitPrice: Float
    discountAmount: Float
    discountPercent: Float
    bonusCount: Float
    productName: String
    isPackage: Boolean
    isTake: Boolean
    productImgUrl: String
    status: String
    manufacturedDate: String
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
    stocks: JSON
  }


  type Order {
    ${commonFields}
    ${orderFields}
    ${paymentInputDefs}
    paidAmounts: [PaidAmount]

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
    origin: String
    customer: PosCustomer
    customerType: String,
    items: [PosOrderItem]
    user: PosUser
    putResponses: [PosPutResponse]

    slotCode: String
  }

  input OrderItemInput {
    _id: String
    productId: String!
    count: Float!
    unitPrice: Float!
    isPackage: Boolean
    isTake: Boolean
    status: String
    manufacturedDate: String
  }

  input PaidAmountInput {
    ${PaidAmountDefs}
  }

  input OrderPaymentInput {
    ${paymentInputDefs}
    paidAmounts: [PaidAmountInput]
  }
`;

export const ordersQueryParams = `
  searchValue: String,
  statuses: [String],
  customerId: String,
  customerType: String,
  startDate: Date,
  endDate: Date,
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int
`;

export const mutations = `
  ordersAdd(${addEditParams}): Order
  ordersEdit(_id: String!, ${addEditParams}): Order
  ordersMakePayment(_id: String!, doc: OrderPaymentInput): PosPutResponse
  orderChangeStatus(_id: String!, status: String): Order
  ordersAddPayment(_id: String!, cashAmount: Float, mobileAmount: Float, paidAmounts: [PaidAmountInput] ): Order
  ordersCancel(_id: String!): JSON
  ordersSettlePayment(_id: String!, billType: String!, registerNumber: String): PosPutResponse
  orderItemChangeStatus(_id: String!, status: String): PosOrderItem
`;

export const queries = `
  orders(searchValue: String, page: Int, perPage: Int): [Order]
  fullOrders(${ordersQueryParams}): [Order]
  ordersTotalCount(${ordersQueryParams}): Int
  orderDetail(_id: String, customerId: String): Order
  ordersCheckCompany(registerNumber: String!): JSON
  ordersDeliveryInfo(orderId: String!): JSON
  fullOrderItems(searchValue: String, statuses: [String], page: Int, perPage: Int, sortField: String, sortDirection: Int): [PosOrderItem]
`;
