import {
  commonFields,
  ordersQueryParams,
  orderTypeFields,
  PaidAmountDefs
} from '../graphql/schema/orders';

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
    primaryEmail: String
    firstName: String
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

  type Order {
    ${orderTypeFields}
  }

  type OrderDetail {
    ${orderTypeFields}
    deal: JSON
    dealLink: String
  }
`;

export const queries = `
  orders(${ordersQueryParams}): [Order]
  fullOrders(${ordersQueryParams}): [Order]
`;
