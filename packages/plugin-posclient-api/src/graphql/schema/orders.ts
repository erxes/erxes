export const commonFields = `
  _id: String!
  createdAt: Date
`;

export const PaidAmountDefs = `
  _id: String
  type: String
  amount: Float
  info: JSON
`;

const paymentInputDefs = `
  cashAmount: Float
  mobileAmount: Float
  directDiscount: Float
  directIsAmount: Boolean
  billType: String
  registerNumber: String
`;

export const orderTypeFields = `
  ${commonFields}
  status: String
  saleStatus: String
  customerId: String
  number: String
  ${paymentInputDefs}
  paidAmounts: [PaidAmount]

  paidDate: Date
  dueDate: Date
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
  description: String
  isPre: Boolean
  origin: String
  customer: PosCustomer
  customerType: String,
  items: [PosOrderItem]
  user: PosUser
  putResponses: [PosPutResponse]
  returnInfo: JSON

  slotCode: String

  extraInfo: JSON
`;

const addEditParams = `
  items: [OrderItemInput],
  totalAmount: Float,
  directDiscount: Float,
  directIsAmount: Boolean,
  type: String,
  branchId: String,
  customerId: String,
  customerType: String,
  deliveryInfo: JSON,
  billType: String,
  registerNumber: String,
  slotCode: String,
  origin: String,
  dueDate: Date,
  status: String,
  saleStatus: String,
  buttonType: String,
  description: String,
  isPre: Boolean,
  isSingle: Boolean,
  deviceId: String,
  couponCode: String
  voucherId: String
`;

export const types = `
  type PaidAmount {
    ${PaidAmountDefs}
  }

  type PosOrderItem {
    ${commonFields}
    productId: String!
    categoryId: String
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
    description: String
    attachment: JSON
    byDevice: JSON
  }

  type PosPutResponse {
    _id: String
    createdAt: Date
    modifiedAt: Date

    id: String
    posId: Float
    status: String
    message: String
    qrData: String
    lottery: String
    date: String
    number: String

    contentType: String
    contentId: String
    posToken: String

    totalAmount: Float
    totalVAT: Float
    totalCityTax: Float
    districtCode: String
    branchNo: String
    merchantTin: String
    posNo: String
    customerTin: String
    customerName: String
    consumerNo: String
    type: String
    inactiveId: String
    invoiceId: String
    reportMonth: String
    data: JSON
    receipts: JSON
    payments: JSON

    easy: Boolean

    sendInfo: JSON
    state: String
  }


  type Order {
    ${orderTypeFields}
  }

  type OrderDetail {
    ${orderTypeFields}
    deal: JSON
    dealLink: String
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
    description: String
    attachment: JSON
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
  types: [String],
  saleStatus: String,
  customerId: String,
  customerType: String,
  startDate: Date,
  endDate: Date,
  dateType: String,
  isPaid: Boolean,
  dueStartDate: Date,
  dueEndDate: Date,
  isPreExclude: Boolean,
  slotCode: String,
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
  orderChangeSaleStatus(_id: String!, saleStatus: String): Order
  ordersChange(_id: String!, dueDate: Date, branchId: String, deliveryInfo: JSON, description: String): Order
  ordersAddPayment(_id: String!, cashAmount: Float, mobileAmount: Float, paidAmounts: [PaidAmountInput] ): Order
  ordersCancel(_id: String!): JSON
  ordersSettlePayment(_id: String!, billType: String!, registerNumber: String): PosPutResponse
  ordersFinish(_id: String, ${addEditParams}): Order
  orderItemChangeStatus(_id: String!, status: String): PosOrderItem
  ordersConvertToDeal(_id: String!): Order
  afterFormSubmit(_id: String!, conversationId: String!): Order
  ordersReturn(_id: String!, cashAmount: Float, paidAmounts: [PaidAmountInput], description: String): Order
`;

export const queries = `
  orders(${ordersQueryParams}): [Order]
  fullOrders(${ordersQueryParams}): [Order]
  ordersTotalCount(${ordersQueryParams}): Int
  orderDetail(_id: String, customerId: String): OrderDetail
  ordersCheckCompany(registerNumber: String!): JSON
  ordersDeliveryInfo(orderId: String!): JSON
  fullOrderItems(searchValue: String, statuses: [String], page: Int, perPage: Int, sortField: String, sortDirection: Int): [PosOrderItem]
  convertedDealLink(_id: String!): JSON
`;
