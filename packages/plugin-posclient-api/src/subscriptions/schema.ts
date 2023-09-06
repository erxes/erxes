import { ordersQueryParams } from '../graphql/schema/orders';

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

const orderTypeFields = `
  ${commonFields}
  ${orderFields}
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
  origin: String
  customer: PosCustomer
  customerType: String,
  items: [PosOrderItem]
  user: PosUser
  putResponses: [PosPutResponse]
  returnInfo: JSON

  slotCode: String
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

  type PosCustomer {
    _id: String!
    code: String
    primaryPhone: String
    firstName: String
    primaryEmail: String
    lastName: String
    primaryAddress: JSON
    addresses: [JSON]
  }

  type PosUserDetailsType {
    avatar: String
    fullName: String
    shortName: String
    birthDate: Date
    position: String
    workStartedDate: Date
    location: String
    description: String
    operatorPhone: String
  }

  type PosUser {
    _id: String!
    createdAt: Date
    username: String
    firstName: String
    lastName: String
    primaryPhone: String
    primaryEmail: String
    email: String
    isActive: Boolean
    isOwner: Boolean
    details: PosUserDetailsType
  }

  type OrderDetail {
    ${orderTypeFields}
    deal: JSON
    dealLink: String
  }

  type Order {
    ${orderTypeFields}
  }
`;

export const queries = `
  orders(${ordersQueryParams}): [Order]
  fullOrders(${ordersQueryParams}): [Order]
`;
