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

  type PreDate {
    _id: String
    dueDate: Date
  }

  type PosclientSlot {
    _id: String
    posToken: String
    code: String
    name: String
    status: String
    isPreDates: [PreDate]
    option: JSON
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
  poscSlots: [PosclientSlot]
`;
