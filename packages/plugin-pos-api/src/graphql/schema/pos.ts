import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

const groupCommonFields = `
  posId: String
  description: String
  name: String
  categoryIds: [String]
  excludedCategoryIds: [String]
  excludedProductIds: [String]
`;

const posCommonFields = `
  name: String
  description: String
  productDetails: [String]
  adminIds: [String]
  cashierIds: [String]
  isOnline: Boolean
  onServer: Boolean
  branchId: String
  departmentId: String
  allowBranchIds: [String]
  beginNumber: String
  maxSkipNumber: Int
  waitingScreen: JSON
  kitchenScreen: JSON
  kioskMachine: JSON
  uiOptions: JSON
  token: String
  ebarimtConfig: JSON
  erkhetConfig: JSON
  initialCategoryIds: [String]
  kioskExcludeProductIds: [String]
  deliveryConfig: JSON
  cardsConfig: JSON
`;

const catProd = `
  _id: String
  categoryId: String
  productId: String
`;

const posOrderFields = contactsEnabled => `
  _id: String,
  createdAt: Date,
  status: String,
  paidDate: Date,
  number: String,
  customerId: String,
  cardAmount: Float,
  cashAmount: Float,
  mobileAmount: Float,
  totalAmount: Float,
  finalAmount: Float,
  shouldPrintEbarimt: Boolean,
  printedEbarimt: Boolean,
  billType: String,
  billId: String,
  registerNumber: String,
  oldBillId: String,
  type: String,
  userId: String,
  items: JSON,
  posToken: String,
  posName: String,
  user: User,
  ${
    contactsEnabled
      ? `
      customer: Customer
    `
      : ''
  }
  syncedErkhet: Boolean
`;

export const types = ({ contactsEnabled, productsEnabled }) => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  ${
    contactsEnabled
      ? `
        extend type Customer @key(fields: "_id") {
          _id: String! @external
        }
      `
      : ''
  }

  ${
    productsEnabled
      ? `
      extend type ProductCategory @key(fields: "_id") {
        _id: String! @external
      }
    `
      : ''
  }

  type CatProd {
    ${catProd}
  }

  type Pos {
    _id: String
    createdAt: Date
    userId: String
    user: User
    ${posCommonFields}
    catProdMappings: [CatProd]
  }

  type PosSlot {
    _id: String
    posId: String
    code: String
    name: String
  }

  type ProductGroups {
    _id: String
    name: String
    description: String
    posId: String
    categoryIds: [String]
    excludedCategoryIds: [String]
    excludedProductIds: [String]
  }

  input GroupInput {
    _id: String
    description: String
    name: String
    categoryIds: [String]
    excludedCategoryIds: [String]
    excludedProductIds: [String]
  }

  input SlotInput {
    _id: String
    posId: String!
    code: String
    name: String
  }

  input CatProdInput {
    ${catProd}
  }


  type PosOrder {
    ${posOrderFields(contactsEnabled)}
  }

  type PosOrderDetail {
    ${posOrderFields(contactsEnabled)}
    putResponses: JSON
    deliveryInfo: JSON
  }

  type PosProduct {
    _id: String!
    name: String
    code: String
    type: String
    sku: String
    unitPrice: Float
    categoryId: String
    createdAt: Date,
    counts: JSON,
    count: Float,
    amount: Float,
    ${
      productsEnabled
        ? `
        category: ProductCategory
      `
        : ''
    }
  }
  type PosProducts {
    products: [PosProduct],
    totalCount: Float,
  }

  type CheckOrderResponse {
    orderId: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  search: String
  paidStartDate: Date
  paidEndDate: Date
  createdStartDate: Date
  createdEndDate: Date
  paidDate: String
  userId: String
  customerId: String
  posToken: String
`;

export const queries = `
  posList(page: Int, perPage: Int, isOnline: String, sortField: String, sortDirection: Int): [Pos]
  posDetail(_id: String!): Pos
  posEnv: JSON
  productGroups(posId: String!): [ProductGroups]
  posSlots(posId: String!): [PosSlot]
  posOrders(${queryParams}): [PosOrder]
  posOrderDetail(_id: String): PosOrderDetail
  posProducts(${queryParams} categoryId: String, searchValue: String): PosProducts
  posOrdersSummary(${queryParams}): JSON
  ecommerceGetBranches(posToken: String): [JSON]
  posOrdersTotalCount(${queryParams}): JSON 
`;

export const mutations = `
  posAdd(${posCommonFields}, catProdMappings: [CatProdInput]): Pos
  posEdit(_id: String, ${posCommonFields}, catProdMappings: [CatProdInput]): Pos
  posRemove(_id: String!): JSON
  productGroupsAdd(${groupCommonFields}): ProductGroups
  productGroupsBulkInsert(posId: String, groups:[GroupInput]): [ProductGroups]
  posSlotBulkUpdate(posId: String, slots: [SlotInput]): [PosSlot]
  posOrderSyncErkhet(_id: String!): PosOrder
  posOrderReturnBill(_id: String!): PosOrder
  posOrderChangePayments(_id: String!, cashAmount: Float, cardAmount: Float, mobileAmount: Float): PosOrder
`;
