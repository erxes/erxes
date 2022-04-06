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
  brandId: String
  tagIds: [String]
  productDetails: [String]
  adminIds: [String]
  cashierIds: [String]
  isOnline: Boolean
  branchId: String
  allowBranchIds: [String]
  beginNumber: String
  maxSkipNumber: Int
  waitingScreen: JSON
  kitchenScreen: JSON
  kioskMachine: JSON
  uiOptions: JSON
  formSectionTitle: String
  formIntegrationIds: [String]
  token: String
  ebarimtConfig: JSON
  erkhetConfig: JSON
  initialCategoryIds: [String]
  kioskExcludeProductIds: [String]
  deliveryConfig: JSON
`;

const catProd = `
  _id: String
  categoryId: String
  productId: String
`;

const posOrderFields = `
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
  syncId: String,
  posName: String,
  user: User,
  customer: Customer,
  syncedErkhet: Boolean
`;

export const types = `
  type CatProd {
    ${catProd}
  }
  type Pos {
    _id: String
    createdAt: Date
    integrationId: String
    userId: String
    integration: Integration
    user: User
    ${posCommonFields}
    catProdMappings: [CatProd]
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
  input CatProdInput {
    ${catProd}
  }
  type PosOrder {
    ${posOrderFields}
  }
  type PosOrderDetail {
    ${posOrderFields}
    putResponses: JSON
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
    count: Float
    category: ProductCategory
  }
  type PosProducts {
    products: [PosProduct],
    totalCount: Float,
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
`;

export const queries = `
  posList(page: Int,
    perPage: Int,
    brandId: String,
    tag: String,
    status: String,
    isOnline: String,
    sortField: String
    sortDirection: Int): [Pos]
  posDetail(_id: String!): Pos
  productGroups(posId: String!): [ProductGroups]
  posOrders(${queryParams}): [PosOrder]
  posOrderDetail(_id: String): PosOrderDetail
  posProducts(${queryParams} categoryId: String, searchValue: String): PosProducts
  posOrdersSummary(${queryParams}): JSON
  ecommerceGetBranches(posToken: String): [Branch]
`;

export const mutations = `
  posAdd(${posCommonFields}, catProdMappings: [CatProdInput]): Pos
  posEdit(_id: String ${posCommonFields}, catProdMappings: [CatProdInput]): Pos
  posRemove(_id: String!): JSON
  productGroupsAdd(${groupCommonFields}): ProductGroups
  productGroupsBulkInsert(posId: String, groups:[GroupInput]): [ProductGroups]
  posOrderSyncErkhet(_id: String!): PosOrder
  posOrderReturnBill(_id: String!): PosOrder
`;
